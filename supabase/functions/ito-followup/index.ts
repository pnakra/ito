import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============================================================================
// SAFETY INVARIANTS (NON-NEGOTIABLE)
// =============================================================================
// 1. NEVER imply permission or encouragement to proceed
// 2. NEVER normalize pressure, repeated asking, silence, or intoxication
// 3. If rationalization is detected, gently redirect without shaming
// 4. Self-harm threats: redirect to crisis resources immediately
// 5. BANNED phrases: "Real talk," "Classic tactic," "Everyone knows"
// 6. No judgment labels: "manipulation," "toxic," "red flag"
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
1. Answer what they're asking directly and helpfully
2. If they ask a question (like "what does enthusiastic consent look like?"), ANSWER IT clearly and concretely
3. If something was unclear or you got it wrong, acknowledge that simply
4. Ask follow-up questions only when relevant — don't deflect with "why do you ask?"
5. Keep responses SHORT — 2-4 sentences max, plus a question if relevant
6. Don't repeat the full assessment. This is a conversation, not a new diagnosis.
7. NEVER respond to a question with "what makes you ask?" or "why are you asking?" — just answer it

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

const MAX_HISTORY_MESSAGES = 12;
const MAX_INITIAL_CONTEXT_CHARS = 4000;
const MAX_RETRIES = 2;

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
    const payload = await req.json().catch(() => null);
    const message = typeof payload?.message === "string" ? payload.message : "";
    const initialContext = typeof payload?.initialContext === "string"
      ? payload.initialContext.slice(0, MAX_INITIAL_CONTEXT_CHARS)
      : "";
    const riskLevel = typeof payload?.riskLevel === "string" ? payload.riskLevel : "unknown";

    const conversationHistory: Message[] = Array.isArray(payload?.conversationHistory)
      ? payload.conversationHistory
          .filter((msg: any) =>
            msg &&
            (msg.role === "user" || msg.role === "assistant") &&
            typeof msg.content === "string"
          )
          .slice(-MAX_HISTORY_MESSAGES)
      : [];

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Build Anthropic messages array (user/assistant only)
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Add initial context as first user message if this is the first follow-up
    if (conversationHistory.length === 0 && initialContext) {
      messages.push({
        role: "user",
        content: `[Initial situation shared by user]\n${initialContext}\n\n[Risk level assigned: ${riskLevel}]\n\nREMINDER: Do not lower the risk level. Do not give permission to proceed.`
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

    console.log("[ito-followup] Calling Claude, messages:", messages.length);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 400,
            system: SYSTEM_PROMPT,
            messages,
          }),
        });

        if (!resp.ok) {
          if (resp.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limits exceeded, please try again in a few seconds." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (resp.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const t = await resp.text();
          console.error(`[ito-followup] Claude error (attempt ${attempt + 1}):`, resp.status, t.slice(0, 500));
          lastError = new Error(`Claude API error: ${resp.status}`);
          continue;
        }

        const data = await resp.json();
        const responseText = typeof data?.content?.[0]?.text === "string"
          ? data.content[0].text.trim()
          : "";

        if (!responseText) {
          console.error(`[ito-followup] Empty response (attempt ${attempt + 1})`);
          lastError = new Error("Empty AI response");
          continue;
        }

        console.log("[ito-followup] Success, length:", responseText.length);

        return new Response(JSON.stringify({ response: responseText }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (attemptErr) {
        console.error(`[ito-followup] Error (attempt ${attempt + 1}):`, attemptErr);
        lastError = attemptErr as Error;
        continue;
      }
    }

    throw lastError ?? new Error("All retry attempts failed");
  } catch (error) {
    console.error("[ito-followup] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        response: "I'm having trouble right now. Can you try again?",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
