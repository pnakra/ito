import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// =============================================================================
// INLINED RATE LIMITER (previously _shared/rate-limiter.ts)
// =============================================================================
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLang = req.headers.get("accept-language") || "unknown";
  return `fingerprint-${hashString(userAgent + acceptLang)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function checkRateLimit(
  clientIP: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  if (Math.random() < 0.1) cleanupExpiredEntries(now);
  const entry = rateLimitStore.get(clientIP);
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  entry.count++;
  rateLimitStore.set(clientIP, entry);
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) rateLimitStore.delete(key);
  }
}

function createRateLimitResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
        "Retry-After": Math.ceil(resetIn / 1000).toString(),
      },
    }
  );
}
// =============================================================================
// END INLINED RATE LIMITER
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============================================================================
// SAFETY INVARIANTS (NON-NEGOTIABLE)
// =============================================================================
// 1. NEVER imply permission or encouragement to proceed
// 2. NEVER normalize pressure, repeated asking, silence, or intoxication
// 3. If rationalization is detected, gently redirect without shaming
// 4. Self-harm threats: redirect to crisis resources immediately
// 5. BANNED phrases: "Real talk," "Classic tactic," "Everyone knows"
// 6. No judgment labels: "manipulation," "toxic," "red flag"
// =============================================================================

const SYSTEM_PROMPT = `You sound like a thoughtful older sibling — someone a teenager would actually trust in a private moment. Calm, real, non-judgmental. You are good at reading social situations.

CONTEXT: The user already got an initial assessment. Now they want to keep talking — maybe to clarify something, correct a misunderstanding, or share more.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER give permission, approval, or encouragement to proceed with escalation
- NEVER normalize pressure, repeated asking, silence as consent, or intoxication
- If rationalizing concerning behavior, gently redirect without shaming
- Self-harm threats: "Threats like that are serious. You are not responsible for their safety. Contact a crisis line or trusted adult."
- BANNED: "Real talk," "Classic tactic," "Everyone knows," "That's manipulation," "red flag," "toxic"

YOUR JOB:
1. Answer what they're asking directly. Do not deflect with "why do you ask?"
2. If they ask a question, ANSWER it clearly and concretely
3. If something was unclear or you got it wrong, just say so simply
4. The core insight should appear by sentence 2 or 3
5. Keep responses to 4-8 sentences. This is a conversation, not a new assessment.

IF RATIONALIZING:
- Acknowledge what they said without agreeing
- Gently note the concerning detail: "I hear you. But you also mentioned [detail]."
- Ask a question that helps them reflect: "How did that feel in the moment?"
- Do NOT lecture

TONE: Short, clear sentences. 8th grade reading level. No em dashes. Talk like a calm friend who gets it. Slight naturalness > sounding polished. Use "they/them" for the other person.

GOOD FOLLOW-UP QUESTIONS:
- "What happened when you said that?"
- "How did they respond?"
- "What made you feel that way?"
- "Has this happened before with them?"

IMPORTANT: NEVER give permission to proceed. If new info is concerning, note it gently. Do not lower the risk level.

Respond in plain conversational text. No JSON, no bullet points.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY_MESSAGES = 12;
const MAX_INITIAL_CONTEXT_CHARS = 4000;
const MAX_RETRIES = 2;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 10, windowMs: 60000 });
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const payload = await req.json().catch(() => null);
    const message = typeof payload?.message === "string" ? payload.message : "";
    const initialContext = typeof payload?.initialContext === "string"
      ? payload.initialContext.slice(0, MAX_INITIAL_CONTEXT_CHARS)
      : "";
    const riskLevel = typeof payload?.riskLevel === "string" ? payload.riskLevel : "unknown";

    const conversationHistory: Message[] = Array.isArray(payload?.conversationHistory)
      ? payload.conversationHistory
          .filter((msg: any) =>
            msg &&
            (msg.role === "user" || msg.role === "assistant") &&
            typeof msg.content === "string"
          )
          .slice(-MAX_HISTORY_MESSAGES)
      : [];

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message is too long. Please keep it under 5000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (conversationHistory.length === 0 && initialContext) {
      messages.push({
        role: "user",
        content: `[Initial situation shared by user]\n${initialContext}\n\n[Risk level assigned: ${riskLevel}]\n\nREMINDER: Do not lower the risk level. Do not give permission to proceed.`,
      });
      messages.push({
        role: "assistant",
        content: "I hear you. What else is on your mind about this?",
      });
    }

    for (const msg of conversationHistory) {
      messages.push(msg);
    }

    messages.push({ role: "user", content: message });

    console.log("[ito-followup] Calling Claude, messages:", messages.length);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 400,
            system: SYSTEM_PROMPT,
            messages,
          }),
        });

        if (!resp.ok) {
          if (resp.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limits exceeded, please try again in a few seconds." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (resp.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const t = await resp.text();
          console.error(`[ito-followup] Claude error (attempt ${attempt + 1}):`, resp.status, t.slice(0, 500));
          lastError = new Error(`Claude API error: ${resp.status}`);
          continue;
        }

        const data = await resp.json();
        const responseText = typeof data?.content?.[0]?.text === "string"
          ? data.content[0].text.trim()
          : "";

        if (!responseText) {
          console.error(`[ito-followup] Empty response (attempt ${attempt + 1})`);
          lastError = new Error("Empty AI response");
          continue;
        }

        console.log("[ito-followup] Success, length:", responseText.length);

        return new Response(JSON.stringify({ response: responseText }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (attemptErr) {
        console.error(`[ito-followup] Error (attempt ${attempt + 1}):`, attemptErr);
        lastError = attemptErr as Error;
        continue;
      }
    }

    throw lastError ?? new Error("All retry attempts failed");
  } catch (error) {
    console.error("[ito-followup] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        response: "I'm having trouble right now. Can you try again?",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
