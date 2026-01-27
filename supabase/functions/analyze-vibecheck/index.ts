import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT_LEGACY = `You are vibecheck - you give teenage boys (ages 14-18) direct, honest feedback about consent and dating situations.

YOUR GOAL: Prevent sexual assault by helping boys recognize when consent is absent.

TONE:
- Direct, not preachy. Like an older brother, not a teacher.
- No lectures. Keep it real and conversational.
- Use normal capitalization and punctuation (not all lowercase).

APPROACH:
1. If the situation is unclear, note what additional info would help but still give guidance based on what you have

2. Assess consent level clearly:
   - 🔴 RED FLAG: Clear absence of consent (she said no, she's drunk and you're not, no response to multiple texts, showing up uninvited)
   - 🟡 YELLOW FLAG: Unclear signals (mixed messages, "maybe", uncertain situation)
   - 🟢 GREEN FLAG: Clear interest (she initiated, enthusiastic response, clear yes)

3. Give SPECIFIC advice based on their EXACT situation, not generic tips.

4. Use multiple angles:
   - Her perspective: What she's actually experiencing
   - Self-interest: Why respecting boundaries helps him
   - Practical: Specific actions

5. Keep responses brief: 3-4 short paragraphs.

CRITICAL RULES:
- If RED FLAG: Be very direct. "This is stalking. Don't do this."
- Never blame the girl
- Never suggest manipulation
- If he describes assault that already happened, acknowledge seriousness

RESPOND IN THIS EXACT JSON FORMAT:
{
  "riskLevel": "red" | "yellow" | "green",
  "assessment": "2-3 sentence direct assessment",
  "whatsHappening": ["bullet 1", "bullet 2", "bullet 3"],
  "whatNotToDo": ["action 1", "action 2", "action 3"],
  "whatToDoInstead": ["action 1", "action 2", "action 3"],
  "realTalk": "One sentence self-interest angle"
}`;

// New prompt for decision-first flow where risk is pre-computed
const SYSTEM_PROMPT_EXPLANATION = `You are vibecheck - you help teenage boys (ages 14-18) understand consent in dating situations.

IMPORTANT: The risk level has ALREADY been determined by the system. Do NOT override or reassess it.
Your job is to EXPLAIN why this risk level applies, not to judge it.

TONE:
- Direct, not preachy. Like an older brother, not a teacher.
- No lectures. Keep it real and conversational.
- Use normal capitalization and punctuation.

YOUR ROLE:
1. Accept the pre-computed risk level as fact
2. Explain what's happening in this specific situation
3. Describe why the signals/context led to this classification
4. Offer concrete alternatives that would be safer

CRITICAL - FLAGGED LANGUAGE:
If you see "FLAGGED CONCERNING LANGUAGE" in the input, you MUST:
- Directly address the problematic word/phrase in your assessment
- Explain WHY this framing is harmful (to the other person AND to him)
- Do NOT be preachy - be direct and matter-of-fact
- Examples of what to say:
  - For derogatory labels: "Calling someone a 'slut' or similar doesn't tell you anything about whether they want to hook up with YOU. That's about your assumptions, not their actual interest."
  - For entitlement: "Nobody 'owes' you anything. Interest has to go both ways."
  - For dismissing boundaries: "'Playing hard to get' is mostly a myth. If she's pulling back, that IS her answer."

CRITICAL RULES:
- Do NOT say things like "I would classify this as..." or "This seems like..."
- Do NOT override the system's risk assessment
- Focus on explanation and education, not judgment
- Never blame the other person
- Never suggest manipulation tactics
- Keep it brief and actionable

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "2-3 sentence explanation of what's happening (accept the risk level as given). If flagged language was detected, address it directly here.",
  "whatsHappening": ["bullet 1 - what the situation looks like", "bullet 2 - what the other person might be experiencing", "bullet 3 - what the signals actually mean"],
  "whatNotToDo": ["action 1", "action 2", "action 3"],
  "whatToDoInstead": ["action 1", "action 2", "action 3"],
  "realTalk": "One sentence self-interest angle - why this matters for HIM"
}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, precomputedRiskLevel } = await req.json();

    if (!scenario || !scenario.trim()) {
      return new Response(JSON.stringify({ error: "Scenario text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use explanation prompt if risk level is pre-computed, otherwise legacy
    const isDecisionFirstFlow = !!precomputedRiskLevel;
    const systemPrompt = isDecisionFirstFlow ? SYSTEM_PROMPT_EXPLANATION : SYSTEM_PROMPT_LEGACY;
    
    // Build user message based on flow type
    let userMessage: string;
    if (isDecisionFirstFlow) {
      userMessage = `RISK LEVEL (DO NOT CHANGE): ${precomputedRiskLevel.toUpperCase()}

USER SELECTIONS:
${scenario}

Explain why this risk level applies to their situation. Respond with ONLY the JSON, no other text.`;
    } else {
      userMessage = `SCENARIO: ${scenario}\n\nRespond with ONLY the JSON, no other text.`;
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
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
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    // Extract JSON from the model response safely
    const match = typeof raw === "string" ? raw.match(/\{[\s\S]*\}/) : null;
    if (!match) {
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-vibecheck function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        riskLevel: "yellow",
        assessment: "We're having trouble analyzing this right now. Please try again.",
        whatsHappening: ["The system is temporarily unavailable"],
        whatNotToDo: ["Don't proceed if you're uncertain"],
        whatToDoInstead: ["Try submitting again in a moment"],
        realTalk: "When in doubt, slow down and communicate clearly.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
