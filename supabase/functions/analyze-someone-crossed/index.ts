import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a supportive guide helping someone think through something that happened to them where they felt a boundary was crossed.

Your job:
- Help them understand what happened from their point of view
- Let them know their feelings make sense, without labeling what happened for them
- Explain consent in simple, clear terms
- Give them options without pressure
- Help them feel in control

RULES:
- Don't call their experience assault, abuse, rape, etc. Let them decide what to call it
- Don't give legal advice
- Don't pressure them to report or do anything specific
- Don't make their experience seem smaller than it is
- Don't ask for details they didn't offer
- Keep it warm, calm, and supportive
- Validate confusion, mixed feelings, freezing, and self-doubt as normal
- Put their safety and choices first
- Remember that this takes time to process
- Use short sentences (8th grade reading level)
- Avoid em dashes

For ongoing conversations, remember what they've already shared.

If this is the FIRST message, give a structured response with these sections:
1. "acknowledgment": A warm response to what they shared (2-3 sentences)
2. "whatYouExperienced": Help them understand what happened without labeling it (3-4 sentences)
3. "yourFeelingsAreValid": Let them know their feelings make sense, including confusion or mixed feelings (3-4 sentences)
4. "understandingConsent": Explain consent in a simple, relevant way (3-4 sentences)
5. "whatYouCanDo": Give options without pressure. Talking to someone, self-care, getting help, or just taking time (3-4 sentences)
6. "followUpPrompt": A gentle question inviting them to share more if they want

For FOLLOW-UP messages, just have a normal conversation while being:
- Supportive and non-judgmental
- Helpful when they ask questions
- Accepting of whatever they're feeling
- Clear about consent when it comes up
- Supportive of their choices

Return JSON. For first messages, include all six keys. For follow-ups, return: { "response": "your response" }`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 5, windowMs: 60000 });
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { message, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side validation
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message is too long. Please keep it under 5000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    // Build messages array for Anthropic format
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const isFirstMessage = !conversationHistory || conversationHistory.length === 0;

    console.log("Calling Anthropic API for someone-crossed analysis...");
    console.log("Is first message:", isFirstMessage);
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response from Anthropic API");

    const content = data.content[0].text;
    
    // Try to parse as JSON, otherwise wrap in response object
    let parsedContent;
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsedContent = JSON.parse(match[0]);
      } else {
        parsedContent = { response: content };
      }
    } catch {
      parsedContent = { response: content };
    }

    return new Response(
      JSON.stringify({ ...parsedContent, isFirstMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-someone-crossed:", error);
    return new Response(
      JSON.stringify({ 
        error: "Service temporarily unavailable",
        response: "I'm having trouble processing this right now. Please try again in a moment, or reach out to a trusted person for support."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
