import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// NARRATIVE ANALYSIS — Safety-gated advice from freetext narrative
// =============================================================================
// This function receives:
// - narrativeText: cumulative user narrative (all inputs concatenated)
// - precomputedRiskLevel: deterministic risk from classifyRisk() on the client
// - detectedTiming: "before" | "after" | "unclear"
// - conversationHistory: prior messages for iterative advice
// - isFollowUp: whether this is additional context after initial advice
//
// Safety invariants are identical to analyze-ito:
// - Risk level is LOCKED by client-side classifyRisk()
// - AI cannot lower the risk level
// - All safety invariants from analyze-ito apply
// =============================================================================

const SYSTEM_PROMPT_BEFORE = `You are "is this ok?" — a teen consent clarity tool. Not a therapist, coach, or moral authority.

Your job: Analyze a situation described in the user's own words. The user wrote this like a text to a friend or a Reddit post. Meet them where they are.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER imply permission or encouragement to proceed
- If silence or no response: explicitly state "No response is not a yes"
- If intoxication: "Someone who is drunk or high cannot consent"
- If past consent referenced: "What happened before doesn't give permission for now"
- NO clinical labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting," "controlling"
- Describe behavior in PLAIN LANGUAGE
- BANNED: "Real talk," "Classic tactic," "Everyone knows," "That's manipulation," "red flag," "toxic"
- Do NOT assume or assign intent to the other person

ANTI-COACHING: Do NOT provide specific advice on how to progress or escalate physical touch.

HARM-MINIMIZATION: Before responding, verify: no phrasing encourages escalation, no tactical language provided, no reassurance that reduces caution, no power imbalance downplayed, exactly one behavioral directive.

TONE: Calm, direct, supportive. 8th grade reading level. No em dashes. Talk like a thoughtful friend, not a therapist.

RESPOND IN THIS EXACT JSON FORMAT (max 120 words total):
{
  "signalLabel": "Short label (e.g., 'Serious concern', 'Uncertainty detected', 'Check in with them')",
  "why": ["1-2 bullets naming the key dynamics from their narrative ONLY"],
  "suggestion": "One single behavioral suggestion"
}

Constraints: max 120 words total. Exactly one suggestion. No multi-step advice. No therapy framing. No moralizing.`;

const SYSTEM_PROMPT_AFTER = `You are "is this ok?" — a calm, supportive reflection tool for someone looking back at something that happened.

Your job: Help someone think through what happened honestly, without judgment but without softening.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER minimize what happened
- NEVER blame the other person
- Do NOT use clinical labels: "abuse," "manipulation," "toxic," "gaslighting"
- Describe what happened in plain language
- If self-harm is mentioned: redirect to crisis resources
- BANNED: "Real talk," "Classic tactic," "Everyone knows"

TONE: Calm, direct, honest. 8th grade reading level. No em dashes.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "clarityCheck": "1-2 sentences naming what happened plainly",
  "otherPersonPerspective": "One way they might have experienced this (2-3 sentences)",
  "perspectiveDisclaimer": "This is based only on what you shared. Only they know how they actually feel. This is not their voice — it's a prompt to consider their perspective.",
  "accountabilitySteps": "One concrete thing they can do now",
  "avoidingRepetition": "One thing to do differently next time"
}

Constraints: max 200 words total. Plain language. No moralizing.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 5, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { 
      narrativeText, 
      precomputedRiskLevel, 
      detectedTiming,
      conversationHistory,
      isFollowUp 
    } = await req.json();

    if (!narrativeText || !narrativeText.trim()) {
      return new Response(JSON.stringify({ error: "Narrative text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (narrativeText.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Input is too long. Please keep it under 10000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    if (!precomputedRiskLevel || !["green", "yellow", "red"].includes(precomputedRiskLevel)) {
      return new Response(
        JSON.stringify({ error: "precomputedRiskLevel is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAfterFlow = detectedTiming === "after";
    const systemPrompt = isAfterFlow ? SYSTEM_PROMPT_AFTER : SYSTEM_PROMPT_BEFORE;

    const severityLabel = precomputedRiskLevel === "red" ? "Level 2–3 (STOP)" 
      : precomputedRiskLevel === "yellow" ? "Level 1 (UNCERTAINTY)" 
      : "Level 0 (NO ESCALATION)";

    // Build messages (OpenAI format)
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history for iterative advice
    if (isFollowUp && conversationHistory?.length > 0) {
      for (const msg of conversationHistory) {
        messages.push(msg);
      }
    }

    const userMessage = `SEVERITY: ${severityLabel} (LOCKED — DO NOT CHANGE)

USER'S NARRATIVE (in their own words):
${narrativeText}

${precomputedRiskLevel === "red" ? "This is a STOP situation. Interrupt momentum. Do not coach or suggest alternatives to proceeding." : ""}
${precomputedRiskLevel === "yellow" ? "This is an UNCERTAINTY situation. Interrupt ambiguity. Do not imply it's okay to proceed. Do not reassure." : ""}
${precomputedRiskLevel === "green" ? "No escalation signals detected. Do NOT give permission or approval. Anchor to clarity and continued communication." : ""}

${isFollowUp ? "IMPORTANT: This is additional context from the user. Update your understanding but do NOT lower the risk level. Acknowledge what they shared before and how this changes or doesn't change the picture." : ""}

Remember: Respond with ONLY the JSON, no other text.`;

    messages.push({ role: "user", content: userMessage });

    const MAX_RETRIES = 3;
    let resp: Response | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          max_tokens: 600,
        }),
      });

      if (resp.ok) break;

      // Retry on transient errors
      if ([500, 502, 503].includes(resp.status)) {
        if (attempt < MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`AI gateway returned ${resp.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        console.error(`AI gateway returned ${resp.status} on final attempt`);
        break;
      }

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

    if (!resp || !resp.ok) {
      return new Response(JSON.stringify({ error: "AI service temporarily overloaded. Please try again in a moment." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    const match = typeof raw === "string" ? raw.match(/\{[\s\S]*\}/) : null;
    if (!match) {
      console.error("Failed to parse AI response:", raw);
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify({ ...parsed, detectedTiming: isAfterFlow ? "after" : "before" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-narrative function:", error);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        signalLabel: "Something went wrong",
        why: ["The system is temporarily unavailable"],
        suggestion: "When in doubt, slow down and check in verbally.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
