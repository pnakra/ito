import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT_BEFORE = `You are "is this ok?" — a teen consent clarity and harm-prevention tool. Not a therapist, coach, or moral authority.

Your job: Analyze a situation described in the user's own words. The user is often the person who may cause harm — not just someone it's happening to. Your primary purpose is to interrupt harmful momentum before it becomes action.

CORE PRINCIPLE: This tool exists primarily to prevent people from causing harm. Many users will not realize their framing, language, or expectations are problematic. Your job is to name what you see plainly.

WHEN THE USER'S OWN FRAMING IS CONCERNING:
- If the user uses derogatory language about another person, name it directly
- If the user expects or feels entitled to sex, name it clearly
- If the user is treating another person as a means to an end, name it directly

SAFETY INVARIANTS:
- NEVER imply permission to proceed
- Silence is not consent
- Intoxicated people cannot consent
- Past consent is not current consent
- No clinical labels

TONE: Calm, direct, honest. 8th grade reading level.

RESPOND IN JSON:
{
  "signalLabel": "Short label",
  "why": ["1-3 bullets"],
  "suggestion": "One behavioral suggestion"
}`;

const SYSTEM_PROMPT_AFTER = `You are "is this ok?" — a calm reflection tool.

Help the user think through what happened honestly without judgment.

RESPOND IN JSON:
{
  "clarityCheck": "What happened plainly",
  "otherPersonPerspective": "Possible perspective",
  "perspectiveDisclaimer": "Only they know how they feel",
  "accountabilitySteps": "One thing to do now",
  "avoidingRepetition": "One future change"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 20, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { 
      narrativeText, 
      precomputedRiskLevel, 
      detectedTiming,
      conversationHistory,
      isFollowUp,
      structuredSignals 
    } = await req.json();

    if (!narrativeText || !narrativeText.trim()) {
      return new Response(JSON.stringify({ error: "Narrative text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY missing");
    }

    const isAfterFlow = detectedTiming === "after";
    const systemPrompt = isAfterFlow ? SYSTEM_PROMPT_AFTER : SYSTEM_PROMPT_BEFORE;

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (isFollowUp && conversationHistory?.length > 0) {
      for (const msg of conversationHistory) {
        messages.push(msg);
      }
    }

    const userMessage = `Narrative:\n${narrativeText}`;
    messages.push({ role: "user", content: userMessage });

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 600,
        messages: messages.map(m => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content
        }))
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Claude error:", text);
      throw new Error("Claude request failed");
    }

    const data = await resp.json();
    const raw = data?.content?.[0]?.text ?? "";

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse AI response");

    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify({ ...parsed, detectedTiming: isAfterFlow ? "after" : "before" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        signalLabel: "Something went wrong",
        why: ["The system is temporarily unavailable"],
        suggestion: "Slow down and check in verbally.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
