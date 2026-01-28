import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TONE PHILOSOPHY:
// The user is a guy who already understands consent and doesn't want to cause harm.
// He's checking in because he's uncertain, not because he's ignorant.
// Talk to him like a friend who's thinking through the situation with him — not teaching him.
// Keep it conversational and real, but still grammatically correct. Not a lecture, not a meme.

const SYSTEM_PROMPT_LEGACY = `You are vibecheck. You help guys think through dating situations when they're unsure.

CONTEXT: The person asking already understands consent. They're not here to learn — they're here to check in because something feels unclear and they don't want to mess up.

TONE:
- Talk like a friend thinking through the situation with them, not like a teacher explaining consent
- Conversational but still grammatically correct — no all-lowercase, no forced slang
- Skip the obvious stuff they already know. Get to what's actually useful.
- Don't moralize or lecture. They came here voluntarily; treat that seriously.

APPROACH:
1. If the situation is unclear, note what additional info would help but still give guidance based on what you have

2. Assess consent level clearly:
   - 🔴 RED: Clear problem (they said no, they're impaired, no response, showing up uninvited)
   - 🟡 YELLOW: Unclear signals (mixed messages, "maybe", uncertain situation)
   - 🟢 GREEN: Clear mutual interest (they initiated, enthusiastic response, clear yes)

3. Give SPECIFIC advice based on their EXACT situation, not generic tips

4. Think through multiple angles:
   - Their perspective: What the other person is likely experiencing
   - His perspective: Why this matters for him
   - Practical: Specific things to do or not do

5. Keep responses brief: 3-4 short paragraphs

CRITICAL RULES:
- If RED: Be direct without being preachy. "This isn't going to go well. Here's why."
- Never blame the other person
- Never suggest manipulation

RESPOND IN THIS EXACT JSON FORMAT:
{
  "riskLevel": "red" | "yellow" | "green",
  "assessment": "2-3 sentence direct assessment",
  "whatsHappening": ["bullet 1", "bullet 2", "bullet 3"],
  "whatNotToDo": ["action 1", "action 2", "action 3"],
  "whatToDoInstead": ["action 1", "action 2", "action 3"],
  "realTalk": "One sentence — the thing he actually needs to hear"
}`;

// Prompt for GREEN risk level - minimal, non-permissive
const SYSTEM_PROMPT_GREEN = `You are vibecheck. You help guys think through dating situations when they're unsure.

CONTEXT: The system determined there are no red flags here. But that's not a green light — just means nothing's obviously wrong.

The person asking already understands consent. They checked in because something felt unclear. Respect that.

TONE:
- Brief. This is the shortest response type.
- No reassurance, no "you're good" language
- Talk like a friend, not a teacher

YOUR ROLE:
1. Briefly acknowledge the situation looks okay for now
2. Remind them consent is ongoing — things can change
3. Keep it minimal. They don't need a lecture.

CRITICAL RULES:
- NEVER say "you're good", "safe to proceed", "okay to continue", or any approval language
- Don't validate their plans — just observe the situation
- Keep "whatNotToDo" and "whatToDoInstead" as EMPTY arrays
- Be brief — a few sentences max

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "1-2 sentences. No obvious red flags right now. But consent is ongoing.",
  "whatsHappening": ["1-2 brief neutral observations max"],
  "whatNotToDo": [],
  "whatToDoInstead": [],
  "realTalk": "Brief reminder about staying tuned in, not validation"
}`;

// Prompt for YELLOW/RED risk levels - full explanation
const SYSTEM_PROMPT_EXPLANATION = `You are vibecheck. You help guys think through dating situations when they're unsure.

CRITICAL: The risk level has ALREADY been determined. Don't override it. Your job is to explain why this level applies.

CONTEXT: The person asking already understands consent. They're checking in because something felt unclear. Talk to them like someone who's trying to do the right thing and needs clarity, not a lesson.

TONE:
- Conversational but grammatically correct. Not a lecture, not a meme.
- Talk like a friend thinking through the situation with them
- Skip the stuff they already know. Get to what matters.
- Direct, but not preachy

YOUR ROLE:
1. Accept the pre-computed risk level as fact
2. Explain what's happening in this specific situation
3. Help them see why the signals point this way
4. Offer concrete alternatives

FLAGGED LANGUAGE:
If the input contains "FLAGGED:" followed by a category, the system detected concerning language.
When you see this:
- Call out the specific problematic word or attitude directly (but don't repeat "FLAGGED" or system labels)
- Explain why this framing is a problem — for them and for the other person
- Be direct, not preachy. Example:
  - "Calling someone a 'slut' doesn't tell you whether they're into YOU. That's your assumption, not their signal."
  - "Nobody owes you anything. Interest goes both ways."
  - "'Playing hard to get' is mostly a myth. If they're pulling back, that's your answer."

CRITICAL RULES:
- Don't say "I would classify this as..." — the system already did
- Don't override the risk level
- Don't blame the other person
- Don't suggest manipulation
- Keep it brief and useful

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "2-3 sentences explaining what's happening. Address any flagged language directly here.",
  "whatsHappening": ["what the situation looks like", "what the other person might be experiencing", "what the signals actually mean"],
  "whatNotToDo": ["specific thing 1", "specific thing 2", "specific thing 3"],
  "whatToDoInstead": ["specific thing 1", "specific thing 2", "specific thing 3"],
  "realTalk": "One sentence — the thing he actually needs to hear"
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

    // Use appropriate prompt based on flow type and risk level
    const isDecisionFirstFlow = !!precomputedRiskLevel;
    let systemPrompt: string;
    
    if (!isDecisionFirstFlow) {
      systemPrompt = SYSTEM_PROMPT_LEGACY;
    } else if (precomputedRiskLevel === "green") {
      systemPrompt = SYSTEM_PROMPT_GREEN;
    } else {
      systemPrompt = SYSTEM_PROMPT_EXPLANATION;
    }
    
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
