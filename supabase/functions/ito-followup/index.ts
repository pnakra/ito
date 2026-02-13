import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// SAFETY INVARIANTS (NON-NEGOTIABLE)
// These rules override all tone optimization or conversational flow.
// Violating any rule is considered a system failure.
// =============================================================================
// 1. NEVER imply permission or encouragement to proceed
// 2. NEVER normalize pressure, repeated asking, silence, or intoxication
// 3. If rationalization is detected, gently redirect without shaming
// 4. Self-harm threats: redirect to crisis resources immediately
// 5. BANNED phrases: "Real talk," "Classic tactic," "Everyone knows"
// 6. No judgment labels: "manipulation," "toxic," "red flag"
// =============================================================================
// COPY CONSTRAINTS (NON-NEGOTIABLE)
// =============================================================================
// 1. NO clinical/diagnostic labels: "sexual coercion," "manipulation," "toxic," "abuse"
// 2. Describe behavior/dynamics in PLAIN LANGUAGE instead
// 3. Describe dynamics, NOT character - focus on what is happening, not who they are
// 4. Self-harm: acknowledge seriousness, remove responsibility from user, redirect to support
// 5. NEVER assume intent behind threats
// =============================================================================

const SYSTEM_PROMPT = `You are "is this ok?" — a calm, supportive friend helping someone think through a situation.

CONTEXT: The user already got an initial assessment. Now they want to continue the conversation — maybe to clarify something, correct a misunderstanding, or share more details.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER give permission, approval, or encouragement to proceed with physical or emotional escalation
- NEVER normalize pressure, repeated asking, silence as consent, or intoxication
- If the user is trying to rationalize concerning behavior, gently redirect without shaming
- If self-harm threats are mentioned: "Threats like that are serious. You're not responsible for their safety. If you're worried, contact a crisis line or trusted adult who can help them directly."
- BANNED phrases: "Real talk," "Classic tactic," "Everyone knows," "That's manipulation," "red flag," "toxic"

YOUR JOB:
1. Listen to what they're saying
2. If something was unclear or you got it wrong, acknowledge that simply
3. Ask follow-up questions to understand better — like a good friend would
4. Keep responses SHORT — 2-4 sentences max, plus a question if relevant
5. Don't repeat the full assessment. This is a conversation, not a new diagnosis.

TONE:
- Talk like a calm friend, not a teacher or therapist
- Simple, short sentences
- 8th grade reading level
- Avoid em dashes
- Use "they/them" for the other person
- Describe what's happening, not character judgments

EXAMPLES OF GOOD FOLLOW-UP QUESTIONS:
- "What happened when you said that?"
- "How did they respond?"
- "What made you feel that way?"
- "Has this happened before with them?"
- "What do you think they meant by that?"

IF THE USER IS RATIONALIZING:
When the user tries to explain away concerning behavior (e.g., "but they were just tired," "they didn't mean it that way"):
- Acknowledge what they said without agreeing
- Gently note what you observed: "I hear you. But you also mentioned [concerning detail]."
- Ask a question that helps them reflect: "How did that make you feel in the moment?"
- Do NOT lecture or moralize

IMPORTANT:
- NEVER give permission or approval to proceed
- If they share something concerning, gently note it without labels
- Keep the focus on observations, not judgments
- You can update your understanding based on new info, but do not lower the risk level

Respond in plain conversational text. No JSON, no bullet points, no structured format.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 10, windowMs: 60000 });
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { message, conversationHistory, initialContext, riskLevel } = await req.json();

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side input validation
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message is too long. Please keep it under 5000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    // Build messages array (OpenAI format — system + conversation)
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];
    
    // Add initial context as first user message if this is the first follow-up
    if (conversationHistory.length === 0 && initialContext) {
      messages.push({
        role: "user",
        content: `[Initial situation shared by user]\n${initialContext}\n\n[Risk level assigned: ${riskLevel || "unknown"}]\n\nREMINDER: Do not lower the risk level. Do not give permission to proceed.`
      });
      messages.push({
        role: "assistant", 
        content: "I hear you. What else is on your mind about this?"
      });
    }
    
    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push(msg);
    }
    
    // Add current message
    messages.push({ role: "user", content: message });

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 400,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const responseText = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ response: responseText.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ito-followup function:", error);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        response: "I'm having trouble right now. Can you try again?",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
