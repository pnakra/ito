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
// 2. RED responses INTERRUPT, not coach - at most ONE actionable suggestion
// 3. NEVER normalize pressure (repeated asking, silence, intoxication, power imbalance)
// 4. Silence is NEVER consent - state explicitly when relevant
// 5. Intoxication INVALIDATES consent - never describe drunk behavior as "interest"
// 6. Past consent does NOT imply present consent - state clearly when referenced
// 7. NO judgment labels ("manipulation," "toxic," "red flag") - describe dynamics, not character
// 8. Self-harm threats: redirect to crisis resources, don't dismiss or assign responsibility
// 9. BANNED phrases: "Real talk," "Classic tactic," "Everyone knows"
// =============================================================================
// COPY CONSTRAINTS (NON-NEGOTIABLE)
// =============================================================================
// 1. NO clinical/diagnostic labels: "sexual coercion," "manipulation," "toxic," "abuse"
// 2. Describe behavior/dynamics in PLAIN LANGUAGE instead
// 3. Describe dynamics, NOT character - focus on what is happening, not who they are
// 4. Self-harm: acknowledge seriousness, remove responsibility from user, redirect to support
// 5. NEVER assume intent behind threats
// =============================================================================

// LEGACY PROMPT REMOVED — Phase 1 requires structured onboarding flow.
// All requests must include precomputedRiskLevel from deterministic classifier.

// Prompt for GREEN risk level - minimal, non-permissive
const SYSTEM_PROMPT_GREEN = `You are "is this ok?" You help people think through situations where they're not sure what's okay.

CONTEXT: Nothing obvious came up. But that's not a "go ahead." It just means nothing bad stood out.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER say "you're good", "safe to proceed", "go ahead", or anything that sounds like permission
- NEVER approve their plans or imply they should continue
- NEVER use phrases like "sounds healthy" or "this seems fine"
- You are describing what you observe, NOT giving a green light

TONE:
- Very brief. This is the shortest response.
- Neutral and observational, not encouraging
- Talk like a friend, not a teacher
- 8th grade reading level
- Avoid em dashes

YOUR JOB:
1. Briefly note that nothing concerning stood out from what they shared
2. Remind them that people can change their mind at any time
3. Remind them to keep paying attention to how the other person is responding
4. Keep it minimal

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "1-2 sentences. Nothing concerning stood out. But consent can be withdrawn anytime.",
  "whatsHappening": ["1-2 short observations about what they described"],
  "whatNotToDo": [],
  "whatToDoInstead": [],
  "summaryLine": "Short reminder to keep checking in"
}`;

// Prompt for YELLOW risk level - explain uncertainty, slow things down
const SYSTEM_PROMPT_YELLOW = `You are "is this ok?" You help people think through situations where they're not sure what's okay.

CONTEXT: The risk level is YELLOW - there's uncertainty or concerning factors. Your job is to explain why slowing down matters.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER imply permission or encouragement to proceed
- NEVER normalize pressure, repeated asking, silence as acceptance, or intoxication
- If silence or no response is mentioned: explicitly state "Silence is not consent"
- If intoxication is mentioned: explicitly state that someone who is drunk or high cannot give meaningful consent
- If past intimacy is referenced: explicitly state that past consent does not mean present consent
- NEVER use judgment labels like "manipulation," "toxic," or "red flag"
- Describe what's happening, not character judgments
- BANNED phrases: "Real talk," "Classic tactic," "Everyone knows," "That's a red flag"

COPY CONSTRAINTS (NON-NEGOTIABLE):
- NO clinical labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting," "controlling," "narcissist"
- Describe behavior in PLAIN LANGUAGE: "This is a pattern of pressure that wears down boundaries over time"
- For surveillance/tracking: say "monitoring where you go" NOT "controlling"; say "checking up constantly" NOT "manipulative"
- For pressure patterns: say "wearing down your answer" NOT "coercion"; say "not accepting no" NOT "manipulation"
- For relationship dynamics: say "not respecting your boundaries" NOT "controlling"; say "dismissing your concerns" NOT "gaslighting"
- NEVER use the word "controlling" in ANY context — always describe the specific behavior instead (e.g., "not letting you decide" or "overriding your choices")
- Focus on WHAT is happening and HOW it affects the user, not WHO someone is
- Do NOT assume or assign intent to the other person's behavior

TONE:
- Talk like a calm friend
- Use simple, short sentences
- Direct but not scary or preachy
- 8th grade reading level
- Avoid em dashes

YOUR JOB:
1. Explain what's creating uncertainty based ONLY on what they told you
2. Do NOT add concerns they didn't mention (like age gaps or power imbalances)
3. Help them understand why pausing to check in matters
4. Give 2-3 clear, specific actions they can take

IF YOU SEE "FLAGGED:" IN THE INPUT:
The system found concerning language. Address it directly:
- Name the specific attitude or framing that's concerning
- Explain simply why it matters, without shaming
- Do NOT use labels like "toxic" or "problematic"

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "2-3 sentences explaining the uncertainty based on THEIR inputs only.",
  "whatsHappening": ["observation 1 from their input", "observation 2", "what the signals suggest"],
  "whatNotToDo": ["instead of [specific behavior from their situation]", "instead of [another specific behavior]", "instead of [third behavior]"],
  "whatToDoInstead": ["specific action 1", "specific action 2", "specific action 3"],
  "summaryLine": "One clear, calm sentence about why checking in matters"
}`;

// Prompt for RED risk level - interrupt momentum, minimal guidance
const SYSTEM_PROMPT_RED = `You are "is this ok?" You help people think through situations where they're not sure what's okay.

CONTEXT: The risk level is RED - there is a serious concern. Your job is to INTERRUPT MOMENTUM, not coach.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- RED responses STOP action. Do not provide step-by-step advice.
- Give AT MOST ONE actionable suggestion
- NEVER imply there's a way to make this okay or continue
- NEVER use "both sides" framing or suggest the situation is understandable
- NEVER normalize repeated asking, silence, intoxication, or pressure
- If silence or no response: "Silence is not consent. Full stop."
- If intoxication: "Someone who is drunk or high cannot consent."
- If past consent referenced: "What happened before doesn't give permission for now."
- If self-harm threats are mentioned: DO NOT dismiss or assume intent. Say: "Threats like this are serious. You are not responsible for their safety. If you believe they may hurt themselves, contact a crisis line or trusted adult who can help them directly."
- NEVER use: "Real talk," "Classic tactic," "Everyone knows," "That's manipulation," "red flag," "toxic"

COPY CONSTRAINTS (NON-NEGOTIABLE):
- NO clinical labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting," "controlling," "narcissist"
- Describe behavior in PLAIN LANGUAGE: "Using threats of self-harm to pressure someone puts unfair responsibility on them"
- Focus on WHAT is happening, not WHO someone is or what their intent might be
- Self-harm: Acknowledge seriousness WITHOUT labeling behavior or assigning intent. Redirect to support.
- For surveillance/tracking/monitoring: say "monitoring where you go" NOT "controlling behavior"; say "checking up constantly" NOT "manipulative"; say "limiting who you see" NOT "isolating you"
- For pressure patterns: say "wearing down your answer" NOT "coercion"; say "not accepting no" NOT "manipulation"

TONE:
- Calm but clear
- Short sentences
- No lectures, no moralizing
- 8th grade reading level
- Avoid em dashes

YOUR JOB:
1. Name the core problem clearly and simply
2. Explain why this is a stop, not a pause
3. Provide AT MOST ONE thing to do (or none if stopping is the only answer)
4. Keep it very brief

DO NOT:
- Provide multiple steps or a game plan
- Suggest ways to check in and then proceed
- Offer alternatives to continuing
- Use both-sides framing
- Use clinical or diagnostic language

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "2-3 sentences naming the core issue directly. No softening.",
  "whatsHappening": ["the main problem", "why it matters"],
  "whatNotToDo": ["the one key thing to not do"],
  "whatToDoInstead": ["one clear action OR empty if stopping is the only answer"],
  "summaryLine": "One direct sentence. The situation requires stopping."
}`;

serve(async (req) => {
  // Handle CORS preflight requests
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
    const { scenario, precomputedRiskLevel } = await req.json();

    if (!scenario || !scenario.trim()) {
      return new Response(JSON.stringify({ error: "Scenario text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side input validation
    if (scenario.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input is too long. Please keep it under 5000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    // Phase 1: Require precomputedRiskLevel — legacy freetext-only flow is deprecated
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
    
    // Build user message with locked risk level
    const userMessage = `RISK LEVEL (LOCKED - DO NOT CHANGE): ${precomputedRiskLevel.toUpperCase()}

USER SELECTIONS:
${scenario}

${precomputedRiskLevel === "red" ? "This is a STOP situation. Interrupt momentum. Do not coach or suggest alternatives to proceeding." : ""}
${precomputedRiskLevel === "yellow" ? "This is a PAUSE situation. Explain uncertainty. Do not imply it's okay to proceed." : ""}
${precomputedRiskLevel === "green" ? "Nothing concerning stood out. Do NOT give permission or approval. Just observe." : ""}

Respond with ONLY the JSON, no other text.`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await resp.text();
      console.error("Anthropic API error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw = data?.content?.[0]?.text ?? "";

    // Extract JSON from the model response safely
    const match = typeof raw === "string" ? raw.match(/\{[\s\S]*\}/) : null;
    if (!match) {
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(match[0]);
    
    // Map summaryLine to realTalk for backward compatibility if needed
    if (parsed.summaryLine && !parsed.realTalk) {
      parsed.realTalk = parsed.summaryLine;
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-ito function:", error);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        riskLevel: "yellow",
        assessment: "We're having trouble analyzing this right now. Please try again.",
        whatsHappening: ["The system is temporarily unavailable"],
        whatNotToDo: ["Do not proceed if you're uncertain"],
        whatToDoInstead: ["Try submitting again in a moment"],
        realTalk: "When in doubt, slow down and check in verbally.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
