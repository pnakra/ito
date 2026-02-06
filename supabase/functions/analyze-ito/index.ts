import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TONE PHILOSOPHY:
// The user is checking in because they're not sure. They're not looking for a lecture.
// Talk to them like a calm friend who's helping them think through something.
// Keep it simple, short, and direct. Avoid therapy-speak or legal language.
// Assume they're trying to do the right thing.

const SYSTEM_PROMPT_LEGACY = `You are "is this ok?" You help people think through situations where they're not sure what's okay.

CONTEXT: The person asking is trying to do the right thing. They're checking in because something feels unclear.

TONE:
- Talk like a calm friend, not a teacher
- Use simple, short sentences
- Say what to do, not what not to do
- No lectures, no judgment, no scary language
- 8th grade reading level
- Avoid em dashes

APPROACH:
1. If something is unclear, say what info would help, but still give guidance

2. Rate the situation:
   - RED: There's a problem (they said no, they're drunk/high, not responding, you're showing up uninvited)
   - YELLOW: Hard to tell (mixed signals, "maybe", unclear situation)
   - GREEN: Looks okay (they started it, they're clearly into it, they said yes)

3. Give advice based on THEIR specific situation, not general tips

4. Think about:
   - How the other person might be feeling
   - Why this matters for the user
   - What to actually do

5. Keep it short: 3-4 short paragraphs

IMPORTANT:
- If RED: Be direct but calm. "This isn't going to work out. Here's why."
- Never blame the other person
- Never suggest ways to convince them

RESPOND IN THIS EXACT JSON FORMAT:
{
  "riskLevel": "red" | "yellow" | "green",
  "assessment": "2-3 sentence summary",
  "whatsHappening": ["point 1", "point 2", "point 3"],
  "whatNotToDo": ["don't do this 1", "don't do this 2", "don't do this 3"],
  "whatToDoInstead": ["do this 1", "do this 2", "do this 3"],
  "realTalk": "One sentence, the main thing they need to hear"
}`;

// Prompt for GREEN risk level - minimal, non-permissive
const SYSTEM_PROMPT_GREEN = `You are "is this ok?" You help people think through situations where they're not sure what's okay.

CONTEXT: Nothing obvious came up. But that's not a "go ahead." It just means nothing bad stood out.

TONE:
- Very brief. This is the shortest response.
- No "you're good" or "safe to continue" language
- Talk like a friend, not a teacher
- 8th grade reading level
- Avoid em dashes

YOUR JOB:
1. Briefly say things look okay right now
2. Remind them people can change their mind anytime
3. Keep it minimal

IMPORTANT:
- NEVER say "you're good", "safe to proceed", or anything that sounds like permission
- Don't approve their plans. Just describe what you see
- Keep "whatNotToDo" and "whatToDoInstead" as EMPTY arrays
- A few sentences max

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "1-2 sentences. Nothing jumped out. But people can change their mind.",
  "whatsHappening": ["1-2 short observations"],
  "whatNotToDo": [],
  "whatToDoInstead": [],
  "realTalk": "Short reminder to keep paying attention"
}`;

// Prompt for YELLOW/RED risk levels - full explanation
const SYSTEM_PROMPT_EXPLANATION = `You are "is this ok?" You help people think through situations where they're not sure what's okay.

IMPORTANT: The risk level is already set. Don't change it. Your job is to explain why.

CONTEXT: The person is trying to do the right thing. They're checking in because something feels off.

TONE:
- Talk like a calm friend
- Use simple, short sentences
- Direct but not scary
- 8th grade reading level
- Avoid em dashes

YOUR JOB:
1. Accept the risk level as-is
2. Explain what's going on ONLY based on what they actually told you
3. Help them see why this is yellow or red
4. Give clear actions

CRITICAL RULES:
- ONLY mention factors the user actually selected or described
- Do NOT add hypothetical concerns (like age gaps or power imbalances) unless they specifically mentioned them
- Do NOT lecture about things they didn't bring up
- Keep your response focused on THEIR specific inputs

IF YOU SEE "FLAGGED:" IN THE INPUT:
The system found concerning language. When you see this:
- Call out the specific word or attitude directly
- Explain why it's a problem, simply and without shaming

IMPORTANT:
- Don't say "I would rate this as..." It's already rated
- Don't change the risk level
- Don't blame the other person
- Don't suggest ways to convince them
- Keep it brief and useful
- ONLY address what they actually shared - nothing more

RESPOND IN THIS EXACT JSON FORMAT:
{
  "assessment": "2-3 sentences explaining what's happening based on THEIR inputs only.",
  "whatsHappening": ["observation 1", "observation 2", "what the signals mean"],
  "whatNotToDo": ["instead of doing X (problematic behavior 1)", "instead of doing Y (problematic behavior 2)", "instead of doing Z (problematic behavior 3)"],
  "whatToDoInstead": ["try this instead 1", "try this instead 2", "try this instead 3"],
  "realTalk": "One sentence, the main thing they need to hear"
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-vibecheck function:", error);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
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
