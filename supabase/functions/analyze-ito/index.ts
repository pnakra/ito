import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============================================================================
// ESCALATION SEVERITY MODEL (0–3) — BEFORE FLOW ONLY
// =============================================================================
// Level 3 (RED)  — Serious Concern: ignoring no, threats, authority exploit, age gap, blackmail, isolation, boundary violations
// Level 2 (RED)  — Clear Imbalance: age imbalance among minors, repeated asking, intoxication, authority-adjacent, manipulation
// Level 1 (YELLOW) — Some Uncertainty: mixed signals, silence as consent, guessing, unclear pacing, momentum on assumption
// Level 0 (GREEN) — No Escalation: no pressure, no imbalance, explicit mutual communication, reciprocal consent
// =============================================================================
// SAFETY INVARIANTS (NON-NEGOTIABLE)
// =============================================================================
// 1. NEVER imply permission or encouragement to proceed
// 2. RED responses INTERRUPT — at most ONE actionable suggestion, no multi-step advice
// 3. NEVER normalize pressure, repeated asking, silence, intoxication, or power imbalance
// 4. Silence is NEVER consent — state explicitly when relevant
// 5. Intoxication INVALIDATES consent — never describe drunk behavior as "interest"
// 6. Past consent does NOT imply present consent
// 7. NO judgment labels ("manipulation," "toxic," "red flag," "abuse," "gaslighting," "controlling," "narcissist")
//    — describe dynamics in plain language instead
// 8. Self-harm threats: redirect to crisis resources, don't dismiss or assign responsibility
// 9. BANNED phrases: "Real talk," "Classic tactic," "Everyone knows"
// 10. Maximum 120 words total. Exactly one behavioral suggestion. No multi-step advice.
// =============================================================================
// HARM-MINIMIZATION CHECK (MANDATORY INTERNAL PASS)
// Before returning output, internally evaluate:
// - Could this response be interpreted as encouraging escalation?
// - Does any phrasing reduce caution in an ambiguous situation?
// - Does it provide tactical language that could be used to pressure someone?
// - Does it downplay or soften a power imbalance?
// - Does it contain more than one behavioral directive?
// If YES to any: regenerate with stronger clarity and stricter constraints.
// =============================================================================

const SYSTEM_PROMPT_GREEN = `You are "is this ok?" — a teen consent clarity tool. Not a therapist, coach, or moral authority.

SEVERITY: Level 0 — No Escalation Signals
No pressure, no imbalance detected. Explicit mutual communication indicated.

GOAL: Encourage continued explicit communication. Never validate escalation. Never say "you're good to go." Still anchor to clarity.

TONE: Calm and steady. Never permissive. 8th grade reading level. No em dashes.

SAFETY:
- NEVER say "you're good", "safe to proceed", "go ahead", or anything like permission
- NEVER approve plans or imply they should continue
- Do NOT use reassurance language
- False reassurance is higher risk than mild over-caution

HARM-MINIMIZATION: Before responding, verify: no phrasing encourages escalation, no tactical language provided, no reassurance that reduces caution.

RESPOND IN THIS EXACT JSON FORMAT (max 120 words total):
{
  "signalLabel": "Check in with them",
  "why": ["1-2 bullets naming what you observed from their input"],
  "suggestion": "One single behavioral suggestion about maintaining explicit communication"
}

Constraints: max 120 words total across all fields. Exactly one suggestion. No multi-step advice. No therapy framing. No moralizing.`;

const SYSTEM_PROMPT_YELLOW = `You are "is this ok?" — a teen consent clarity tool. Not a therapist, coach, or moral authority.

SEVERITY: Level 1 — Some Uncertainty
Triggers: mixed signals, silence interpreted as consent, guessing interest instead of asking, unclear pacing, momentum based on assumption, user unsure how the other person feels.

GOAL: Interrupt ambiguity before escalation. Frame as uncertainty requiring clarity. Do NOT use reassurance language. Do NOT say "no red flags."

TONE: Calm, protective, neutral. Not alarmist. Not permissive. 8th grade reading level. No em dashes.

SAFETY (NON-NEGOTIABLE):
- NEVER imply permission or encouragement to proceed
- If silence or no response: explicitly state "No response is not a yes"
- If intoxication: "Someone who is drunk or high cannot consent"
- If past consent referenced: "What happened before doesn't give permission for now"
- NO clinical labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting," "controlling"
- Describe behavior in PLAIN LANGUAGE: "a pattern of pressure" not "coercion"
- Do NOT assume or assign intent to the other person
- BANNED: "Real talk," "Classic tactic," "Everyone knows," "That's a red flag"

ANTI-COACHING: Do NOT provide specific advice on how to progress or escalate physical touch.

IF "FLAGGED:" APPEARS IN INPUT:
Name the specific attitude or framing that's concerning. Explain simply why it matters, without shaming. Do NOT use labels like "toxic" or "problematic."

HARM-MINIMIZATION: Before responding, verify: no phrasing encourages escalation, no tactical language provided, no reassurance that reduces caution, no power imbalance downplayed, exactly one behavioral directive.

RESPOND IN THIS EXACT JSON FORMAT (max 120 words total):
{
  "signalLabel": "Uncertainty detected",
  "why": ["1-2 bullets naming the key detected dynamics from their input ONLY"],
  "suggestion": "One single behavioral suggestion"
}

Constraints: max 120 words total. Exactly one suggestion. No multi-step advice. No therapy framing. No moralizing. No hedging contradictions. If ambiguity exists, do NOT reassure.`;

const SYSTEM_PROMPT_RED = `You are "is this ok?" — a teen consent clarity tool. Not a therapist, coach, or moral authority.

SEVERITY: Level 2–3 — Serious Concern or Clear Imbalance
Level 3 triggers: ignoring a clear "no", threats (emotional/social/reputational), exploiting authority, significant age gap minor/adult, emotional blackmail, isolation tactics, clear boundary violations.
Level 2 triggers: age imbalance among minors, repeated asking after hesitation, intoxication, authority-adjacent dynamics, one person unsure but continuing, emotional manipulation patterns.

GOAL: Encourage stopping, stepping away, or seeking support. This is a STOP, not a pause.

TONE: Direct, protective, firm. No softening language. No both-sides framing. 8th grade reading level. No em dashes.

SAFETY (NON-NEGOTIABLE):
- RED responses INTERRUPT momentum — at most ONE actionable suggestion
- NEVER imply there's a way to make this okay or continue
- NEVER provide step-by-step advice or alternatives to continuing
- If silence: "No response is not a yes. Full stop."
- If intoxication: "Someone who is drunk or high cannot consent."
- If past consent: "What happened before doesn't give permission for now."
- If self-harm threats: "Threats like this are serious. You are not responsible for their safety. If you believe they may hurt themselves, contact a crisis line or trusted adult."
- NO clinical labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting," "controlling," "narcissist"
- Describe dynamics in PLAIN LANGUAGE
- BANNED: "Real talk," "Classic tactic," "Everyone knows," "That's manipulation," "red flag," "toxic"

HARM-MINIMIZATION: Before responding, verify: no phrasing encourages escalation, no tactical language provided, no power imbalance downplayed, exactly one or zero behavioral directives.

RESPOND IN THIS EXACT JSON FORMAT (max 120 words total):
{
  "signalLabel": "Serious concern",
  "why": ["1-2 bullets naming the core problem clearly"],
  "suggestion": "One clear action (or empty string if stopping is the only answer)"
}

Constraints: max 120 words total. Exactly one suggestion or none. No multi-step advice. No therapy framing. No moralizing. Tone must be direct and protective.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 5, windowMs: 60000 });
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { scenario, precomputedRiskLevel } = await req.json();

    if (!scenario || !scenario.trim()) {
      return new Response(JSON.stringify({ error: "Scenario text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (scenario.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input is too long. Please keep it under 5000 characters." }),
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
        JSON.stringify({ error: "precomputedRiskLevel is required. Use the structured onboarding flow." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt: string;
    if (precomputedRiskLevel === "green") {
      systemPrompt = SYSTEM_PROMPT_GREEN;
    } else if (precomputedRiskLevel === "yellow") {
      systemPrompt = SYSTEM_PROMPT_YELLOW;
    } else {
      systemPrompt = SYSTEM_PROMPT_RED;
    }
    
    const severityLabel = precomputedRiskLevel === "red" ? "Level 2–3 (STOP)" 
      : precomputedRiskLevel === "yellow" ? "Level 1 (UNCERTAINTY)" 
      : "Level 0 (NO ESCALATION)";

    const userMessage = `SEVERITY: ${severityLabel} (LOCKED — DO NOT CHANGE)

USER SELECTIONS:
${scenario}

${precomputedRiskLevel === "red" ? "This is a STOP situation. Interrupt momentum. Do not coach or suggest alternatives to proceeding." : ""}
${precomputedRiskLevel === "yellow" ? "This is an UNCERTAINTY situation. Interrupt ambiguity. Do not imply it's okay to proceed. Do not reassure." : ""}
${precomputedRiskLevel === "green" ? "No escalation signals detected. Do NOT give permission or approval. Anchor to clarity and continued communication." : ""}

Remember: max 120 words total. Exactly one behavioral suggestion (or none for red). No multi-step advice.
Respond with ONLY the JSON, no other text.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 512,
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
    const raw = data?.choices?.[0]?.message?.content ?? "";

    const match = typeof raw === "string" ? raw.match(/\{[\s\S]*\}/) : null;
    if (!match) {
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-ito function:", error);
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
