import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a guide continuing a conversation with someone who's already been thinking through a situation where they might have crossed a boundary.

They've already seen information about:
- What might have happened
- How the other person might have felt
- Their own patterns
- What to do now
- How to do better

Now they're asking follow-up questions or want to talk more.

Your job:
- Keep the same calm, supportive tone
- Answer their questions thoughtfully
- Give more perspective if it helps
- Remind them of healthy relationship basics
- Encourage them to keep thinking and growing

RULES:
- Don't give legal advice
- Don't tell them to confess to anything
- Don't ask for sexual details
- Don't describe sexual acts
- Don't roleplay
- Don't shame or lecture
- Keep it calm and practical
- Use short sentences (8th grade reading level)
- Avoid em dashes
- Suggest talking to a trusted adult if it seems serious

Answer conversationally but thoughtfully.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, originalReflection } = await req.json();

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

    // Include original reflection context if provided
    if (originalReflection) {
      messages.push({
        role: "assistant",
        content: `Here's what we discussed earlier:\n\n**Clarity Check:** ${originalReflection.clarityCheck}\n\n**Understanding Others' Boundaries:** ${originalReflection.otherPersonPerspective}\n\n**Understanding Your Patterns:** ${originalReflection.yourPatterns}\n\n**Taking Responsibility:** ${originalReflection.accountabilitySteps}\n\n**Doing Better:** ${originalReflection.avoidingRepetition}`
      });
    }

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

    console.log("Calling Anthropic API for crossed-line followup...");
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
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

    return new Response(
      JSON.stringify({ response: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in crossed-line-followup:", error);
    return new Response(
      JSON.stringify({ 
        error: "Service temporarily unavailable",
        response: "I'm having trouble processing this right now. Please try again in a moment."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
