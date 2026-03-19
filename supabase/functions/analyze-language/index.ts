import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─── INLINED RATE LIMITER ────────────────────────────────────────────────────
interface RateLimitEntry { count: number; resetTime: number; }
const rateLimitStore = new Map<string, RateLimitEntry>();
interface RateLimitConfig { maxRequests: number; windowMs: number; }

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLang = req.headers.get("accept-language") || "unknown";
  let hash = 0;
  for (const ch of userAgent + acceptLang) { hash = ((hash << 5) - hash) + ch.charCodeAt(0); hash = hash & hash; }
  return `fp-${Math.abs(hash).toString(36)}`;
}

function checkRateLimit(clientIP: string, config: RateLimitConfig): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  if (Math.random() < 0.1) { for (const [k, e] of rateLimitStore) { if (now > e.resetTime) rateLimitStore.delete(k); } }
  const entry = rateLimitStore.get(clientIP);
  if (!entry || now > entry.resetTime) { rateLimitStore.set(clientIP, { count: 1, resetTime: now + config.windowMs }); return { allowed: true, resetIn: config.windowMs }; }
  if (entry.count >= config.maxRequests) return { allowed: false, resetIn: entry.resetTime - now };
  entry.count++;
  return { allowed: true, resetIn: entry.resetTime - now };
}

function createRateLimitResponse(resetIn: number): Response {
  return new Response(JSON.stringify({ error: "Too many requests. Please try again later.", retryAfter: Math.ceil(resetIn / 1000) }), {
    status: 429, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Retry-After": Math.ceil(resetIn / 1000).toString() }
  });
}
// ─────────────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You check text for serious consent-related warning signs. Your job is to catch subtle patterns that word-matching might miss.

WHAT TO LOOK FOR:
1. Incapacitation: signs that someone is or was drunk, high, asleep, passed out, or otherwise unable to consent
2. Force or coercion: physical force, threats, not taking no for an answer, pressuring someone past their limits
3. Reported boundary violations: the user describing something being done to them without consent — someone who wouldn't stop, who kept pushing, who ignored a no
4. Exploitation: planning to take advantage of someone's vulnerability or impaired state

DO NOT FLAG:
- Degrading or derogatory language on its own — this is emotional context, not a consent violation signal
- Entitlement language, frustration, jealousy, or dismissive attitudes — these are noted elsewhere and handled through conversation
- Anything that is purely attitudinal without indicating actual harm, force, or incapacitation

KEY: Only flag patterns that indicate real incapacitation, force, or reported violations. Attitudinal language is detected separately and the AI mentor handles it through conversation — not escalation.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "hasConcerningLanguage": boolean,
  "categories": ["category1", "category2"],
  "explanation": "Short, plain-language explanation of the specific signal detected"
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

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 15, windowMs: 60000 });
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ hasConcerningLanguage: false, categories: [], explanation: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side input validation
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ hasConcerningLanguage: false, categories: [], explanation: null, error: "Input too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
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
          { role: "user", content: `Analyze this text for serious consent-related warning signs:\n\n"${text}"` },
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
