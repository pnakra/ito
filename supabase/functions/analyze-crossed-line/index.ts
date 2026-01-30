import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a guide helping someone think through a situation where they're worried they went too far or hurt someone.

Your job is to help them:
- Understand what might have happened
- See how the other person might have felt
- Think about their own patterns
- Figure out what to do now
- Learn how to do better

RULES:
- Don't give legal advice
- Don't tell them to confess to anything
- Don't ask for sexual details
- Don't describe sexual acts
- Don't roleplay
- Don't shame or lecture
- Keep it calm, simple, and direct
- Use short sentences (8th grade reading level)
- Avoid em dashes
- Suggest talking to a trusted adult if it seems serious

Your response should be JSON with these exact keys:

1. "clarityCheck": Help them understand what happened. MUST include: "It's possible the other person wasn't comfortable, even if they didn't say so."

2. "otherPersonPerspective": How the other person might have felt. MUST include: "Some people freeze or go quiet when they're uncomfortable. Not because they want things to continue, but because they don't know how to stop it. Just because someone doesn't say 'no' doesn't mean they're saying 'yes.'"

3. "yourPatterns": Help them think about their own behavior. MUST include: "Part of thinking this through is noticing what you tend to do when you're nervous, excited, or really into someone. Learning to pause and ask is a skill. Especially if you tend to move fast or focus more on what you want than what they're showing you."

4. "accountabilitySteps": What they can do now. MUST include: "The right move now is to give them space and not reach out unless they want you to. Don't push for a conversation. That can make things worse. If a good moment comes up later, a short and honest 'I'm sorry for what I did' (focused on you, not their reaction) might help. But right now, the most important thing is respecting their space and thinking about how to act differently going forward."

5. "avoidingRepetition": How to do better. MUST include: "Practice asking out loud, even during things like kissing, with stuff like 'Is this okay?' or 'Want to keep going?' Make it easy for them to say no or slow down at any point. Get in the habit of pausing, being okay with not knowing, and making sure you're both into it."

Never act certain. Use words like "it's possible" and "one way to think about this is."

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
