import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You analyze text for concerning attitudes about consent and dating. Your job is to detect subtle problematic language that pattern matching might miss.

CONCERNING PATTERNS TO DETECT:
1. Entitlement - believing they're owed something, "nice guy" mentality, friend zone complaints
2. Objectification - reducing someone to their sexual history/reputation
3. Dismissing boundaries - reframing rejection as "playing games", "leading on", etc.
4. Victim blaming - suggesting clothing, drinking, or behavior = consent
5. Manipulation - using guilt, pressure, or secrecy tactics
6. Dehumanizing language - slurs, degrading terms, treating as conquest

IMPORTANT:
- Look for ATTITUDE, not just words. "She's been with a lot of guys" implies objectification even without slurs.
- Detect REFRAMING of rejection. "She says no but..." is concerning even without explicit flag words.
- Catch ENTITLEMENT patterns. Frustration about being "friend zoned" or "led on" suggests problematic thinking.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "hasConcerningLanguage": boolean,
  "categories": ["category1", "category2"],
  "explanation": "Brief explanation of what was detected and why it's concerning"
}

If the text seems neutral or respectful, return:
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this text for concerning attitudes:\n\n"${text}"` },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429 || resp.status === 402) {
        // On rate limit or payment issues, fail gracefully - let static detection handle it
        return new Response(
          JSON.stringify({ hasConcerningLanguage: false, categories: [], explanation: null, fallback: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${resp.status}`);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

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
