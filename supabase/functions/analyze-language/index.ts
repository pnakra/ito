import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You check text for concerning attitudes about consent and dating. Your job is to catch subtle problems that simple word-matching might miss.

THINGS TO LOOK FOR:
1. Entitlement — thinking they're owed something, "nice guy" attitude, complaining about being "friend zoned"
2. Treating someone like an object — judging them by how many people they've been with
3. Ignoring boundaries — saying rejection is "playing games" or "leading on"
4. Blaming them — suggesting their clothes, drinking, or behavior = consent
5. Manipulation — using guilt, pressure, or secrecy
6. Disrespectful language — slurs, degrading words, treating them like a prize

IMPORTANT:
- Look for ATTITUDE, not just words. "They've been with a lot of people" shows a problem even without slurs.
- Watch for REFRAMING of rejection. "They said no but..." is concerning even without bad words.
- Catch ENTITLEMENT. Being frustrated about being "friend zoned" or "led on" is a red flag.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "hasConcerningLanguage": boolean,
  "categories": ["category1", "category2"],
  "explanation": "Short explanation of what you found and why it matters"
}

If the text seems fine, return:
{
  "hasConcerningLanguage": false,
  "categories": [],
  "explanation": null
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ hasConcerningLanguage: false, categories: [], explanation: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
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
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: `Analyze this text for concerning attitudes:\n\n"${text}"` },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        // On rate limit, fail gracefully - let static detection handle it
        return new Response(
          JSON.stringify({ hasConcerningLanguage: false, categories: [], explanation: null, fallback: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Anthropic API error: ${resp.status}`);
    }

    const data = await resp.json();
    const raw = data?.content?.[0]?.text ?? "";

    const match = typeof raw === "string" ? raw.match(/\{[\s\S]*\}/) : null;
    if (!match) {
      return new Response(
        JSON.stringify({ hasConcerningLanguage: false, categories: [], explanation: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-language function:", error);
    // Fail gracefully - static detection will still work
    return new Response(
      JSON.stringify({ hasConcerningLanguage: false, categories: [], explanation: null, error: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
