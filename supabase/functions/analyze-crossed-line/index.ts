import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a reflective guide helping a young person process a situation where they think they may have crossed a boundary or hurt someone.

Your goal is to help them:
- Understand what likely happened
- Recognize signs of discomfort or non-consent
- Reflect on their own mindset, assumptions, impulses
- Identify specific moments where they could have slowed down or paused
- Consider accountability steps
- Learn healthier behavior going forward

You MUST follow these rules:
- Do NOT provide legal advice
- Do NOT encourage confessions to crimes
- Do NOT ask for sexual details
- Do NOT describe sexual acts
- Do NOT roleplay
- Do NOT moralize, shame, or scold
- Keep tone neutral, steady, practical
- Use reflection, not judgment
- Emphasize accountability, safety, and empathy
- Encourage seeking a trusted adult or professional if needed
- Recognize that the user may be distressed, confused, or afraid

Your output format should be a JSON object with these exact keys:

1. "clarityCheck": Help them understand what happened. MUST include this exact sentence: "It's possible the other person did not feel comfortable continuing, even if they didn't say so directly."

2. "otherPersonPerspective": Explain how the other person may have experienced the situation. MUST include: "Some people freeze up or go quiet—not because they want something to continue, but because they feel uncomfortable, overwhelmed, or unsure how to stop it. A lack of active participation is not consent."

3. "yourPatterns": Help them reflect on their own behavior and emotional state. MUST include: "Part of reflection is recognizing what you tend to do when you feel nervous, excited, pressured, or strongly attracted. Learning to pause, breathe, and check in verbally is a key skill — especially if you tend to move quickly or focus more on your own cues than the other person's."

4. "accountabilitySteps": Explain what accountability looks like. MUST include: "Accountability starts with respecting their space and not seeking contact unless they clearly want it. Repair must be survivor-led. They may not want dialogue, and pushing for it can cause further harm. Accountability also means learning to pause your impulses, notice when someone pulls back or goes quiet, and recognize that stopping is part of healthy sexual behavior. If an appropriate moment arises in the future, a brief and sincere apology focused on your actions — not their reaction — may be appropriate. But the priority now is respecting their boundaries and reflecting on how to act differently moving forward."

5. "avoidingRepetition": Provide guidance on how to do better. MUST include: "Practice checking in verbally — even during non-verbal interactions like kissing — with phrases like 'Is this okay?' or 'Do you want to keep going?' Create opportunities for the other person to disengage or express discomfort at any time. Build the habit of slowing down, tolerating uncertainty, and prioritizing mutual enthusiasm over ambiguity."

Never imply certainty — always use softening language ("it's possible…", "one interpretation is…").

Return ONLY valid JSON with these five keys.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario } = await req.json();

    if (!scenario) {
      return new Response(
        JSON.stringify({ error: "Scenario is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    console.log("Calling Anthropic API...");
    
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
        messages: [
          { role: "user", content: scenario }
        ],
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
    
    // Extract JSON from response
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Failed to parse AI response");
    }
    
    const parsedContent = JSON.parse(match[0]);

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-crossed-line:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An error occurred",
        clarityCheck: "We're having trouble processing this right now.",
        otherPersonPerspective: "Please try again in a moment.",
        yourPatterns: "",
        accountabilitySteps: "If this continues, please seek support from a trusted adult.",
        avoidingRepetition: ""
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
