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
{
  "clarityCheck": "string - what might have happened, using softening language",
  "otherPersonPerspective": "string - what might have been going on for the other person",
  "yourPatterns": "string - what might have been going on for the user",
  "accountabilitySteps": "string - concrete examples of what accountability looks like",
  "avoidingRepetition": "string - specific steps to avoid repeating this behavior"
}

Never imply certainty — always use softening language ("it's possible…", "one interpretation is…").`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: scenario }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service requires payment. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response from AI Gateway");

    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);

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
