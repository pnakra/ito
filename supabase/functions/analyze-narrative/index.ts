import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT_BEFORE = `You sound like a thoughtful older sibling — someone a teenager would actually trust in a private moment. Calm, real, non-judgmental. You help them make sense of confusing or awkward situations without shaming them or telling them what kind of person they are.

Assume they're asking because they care about doing the right thing — even if they feel unsure, embarrassed, or anxious.

YOUR JOB: Read what they're actually saying. Give them an honest, useful read.

RESPONSE SHAPE:
1. Start by normalizing the question or emotion (reduce shame immediately)
2. Give a clear, honest read by sentence 2 or 3 (don't bury the insight)
3. Briefly explain the reasoning in simple language
4. End with a grounded, calm takeaway

CRITICAL: Read what they are actually describing.
- If someone is calling them names or being emotionally cruel — name it as such
- Do NOT use physical escalation framing for non-physical situations
- If the user is setting healthy boundaries — AFFIRM that
- If the user's own framing is concerning (entitlement, derogatory language) — name it directly
- If they're describing something happening TO them — be supportive, don't blame them

SAFETY INVARIANTS:
- Silence is not consent
- Intoxicated people cannot consent
- Past consent is not current consent
- No clinical labels — describe behavior in plain language

TONE: Short, clear sentences. 8th grade reading level. No em dashes. No lectures. Slight naturalness > sounding polished. Default to 4-8 sentences unless more depth is clearly needed.

FORMATTING: Always proper sentence case. American English spelling.

RESPOND IN JSON:
{
  "signalLabel": "Short, accurate label that reflects what's actually going on",
  "why": ["1-3 sentences — specific to what they said, not generic advice"],
  "suggestion": "One practical suggestion that actually helps their specific situation"
}`;

const SYSTEM_PROMPT_AFTER = `You sound like a thoughtful older sibling — someone a teenager would actually trust after something went wrong. Calm, honest, direct. Not a therapist, teacher, or moral authority. You help them understand what happened without shaming them or letting them off the hook.

YOUR JOB:
1. Start by reducing shame — name that asking is the right move
2. Give the honest read early, by sentence 2 or 3
3. Name what happened plainly, without clinical labels
4. Consider how the other person might have experienced it — one way they might have felt, not a definitive statement
5. Give one concrete thing to do now, and one thing to watch in future

TONE: Short, clear sentences. 8th grade reading level. No em dashes. Slight naturalness > sounding polished. Direct, not preachy.
FORMATTING: Always proper sentence case. NEVER all lowercase. American English spelling. "ito" is always lowercase.

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER imply the other person is fine with what happened if the user is describing boundary-crossing behavior
- NEVER normalize pressure, intoxication, repeated asking, or ignoring signals
- NEVER provide tactical language that could be used to minimize or explain away what happened
- Intoxication means the other person could not fully consent — state this plainly when relevant
- If the user describes clear assault, name it as serious without labeling the user as a bad person
- NO clinical labels — describe behavior and dynamics in plain language, not character
- BANNED labels: "manipulation," "toxic," "abuse," "gaslighting," "coercion," "narcissist," "red flag"
- BANNED phrases: "Real talk," "Classic tactic," "Everyone knows"
- Self-harm threats: "Threats like that are serious. You are not responsible for their safety. Contact a crisis line or trusted adult."
- Do NOT assign a definitive account of how the other person felt — use "one way they might have experienced this" framing

ANTI-COACHING: Do NOT suggest ways to explain the situation to the other person that minimize what happened. Do NOT advise on how to convince them it was okay.

HARM-MINIMIZATION CHECK — before returning output, internally evaluate:
- Could this response be read as excusing or minimizing what the user described?
- Does any phrasing reduce the other person's experience to something trivial?
- Does it provide language the user could use to justify or rationalize the behavior?
- Does it contain more than one concrete action?
- If YES to any: regenerate with stronger clarity.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "clarityCheck": "What happened, said plainly — 1-3 sentences. Honest, not harsh.",
  "otherPersonPerspective": "One way they might have experienced it — framed as possibility, not fact.",
  "perspectiveDisclaimer": "A brief reminder that only they know how they feel.",
  "accountabilitySteps": "One concrete thing to do now.",
  "avoidingRepetition": "One thing to notice or change going forward."
}`;

const MAX_RETRIES = 2;

/** Coerce value to trimmed string */
function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Coerce value to string array */
function cleanArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((i) => (typeof i === "string" ? i.trim() : "")).filter(Boolean);
}

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
      structuredSignals,
    } = await req.json();

    if (!narrativeText?.trim()) {
      return new Response(JSON.stringify({ error: "Narrative text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    const isAfterFlow = detectedTiming === "after";
    const systemPrompt = isAfterFlow ? SYSTEM_PROMPT_AFTER : SYSTEM_PROMPT_BEFORE;

    // Build Anthropic messages array (user/assistant only, system goes in separate param)
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (isFollowUp && conversationHistory?.length > 0) {
      for (const msg of conversationHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    const severityReminder = isAfterFlow
      ? `This is an AFTER situation — something already happened. Give the honest read. Do not minimize or excuse. Do not give tactical language to rationalize the behavior.`
      : precomputedRiskLevel === "red"
      ? `SEVERITY: LOCKED RED (DO NOT CHANGE). This is a STOP situation. Interrupt momentum. Do not coach or suggest alternatives to proceeding.`
      : precomputedRiskLevel === "yellow"
      ? `SEVERITY: LOCKED YELLOW (DO NOT CHANGE). This is an UNCERTAINTY situation. Interrupt ambiguity. Do not imply it is okay to proceed. Do not reassure.`
      : `SEVERITY: LOCKED GREEN (DO NOT CHANGE). No escalation signals detected. Do NOT give permission or use the phrase "green flag" or "green light." Anchor to clarity and continued communication.`;

    messages.push({ role: "user", content: `Narrative:\n${narrativeText}\n\n${severityReminder}\n\nRemember: Respond with ONLY the JSON, no other text.` });

    console.log("[analyze-narrative] Calling Claude, isAfter:", isAfterFlow, "messages:", messages.length);

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
            max_tokens: 600,
            system: systemPrompt,
            messages,
          }),
        });

        if (!resp.ok) {
          if (resp.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const text = await resp.text();
          console.error(`[analyze-narrative] Claude error (attempt ${attempt + 1}):`, resp.status, text.slice(0, 500));
          lastError = new Error(`Claude API error: ${resp.status}`);
          continue;
        }

        const data = await resp.json();
        const raw = data?.content?.[0]?.text ?? "";
        console.log("[analyze-narrative] Response length:", raw.length, "stop_reason:", data?.stop_reason);

        if (!raw.trim()) {
          console.error(`[analyze-narrative] Empty response (attempt ${attempt + 1})`);
          lastError = new Error("Empty AI response");
          continue;
        }

        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          console.error(`[analyze-narrative] No JSON found (attempt ${attempt + 1}):`, raw.slice(0, 300));
          lastError = new Error("Failed to parse AI response");
          continue;
        }

        const parsed = JSON.parse(match[0]);

        // Normalize all fields to ensure clean output
        let result: Record<string, unknown>;

        if (isAfterFlow) {
          result = {
            clarityCheck: clean(parsed.clarityCheck) || "Something important happened here.",
            otherPersonPerspective: clean(parsed.otherPersonPerspective) || "They may see this differently.",
            perspectiveDisclaimer: clean(parsed.perspectiveDisclaimer) || "Only they know how they feel.",
            accountabilitySteps: clean(parsed.accountabilitySteps) || "Pause and reflect before acting.",
            avoidingRepetition: clean(parsed.avoidingRepetition) || "Notice the pattern and name it.",
            detectedTiming: "after",
          };
        } else {
          const why = cleanArr(parsed.why);
          result = {
            signalLabel: clean(parsed.signalLabel) || "Check in with them",
            why: why.length > 0 ? why : ["Something feels unclear here."],
            suggestion: clean(parsed.suggestion) || "Pause and ask them directly.",
            detectedTiming: "before",
          };
        }

        console.log("[analyze-narrative] Success, keys:", Object.keys(result));

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseErr) {
        console.error(`[analyze-narrative] Error (attempt ${attempt + 1}):`, parseErr);
        lastError = parseErr as Error;
        continue;
      }
    }

    throw lastError || new Error("All retry attempts failed");
  } catch (error) {
    console.error("[analyze-narrative] Error:", error);
    return new Response(
      JSON.stringify({
        signalLabel: "Something went wrong",
        why: ["The system is temporarily unavailable."],
        suggestion: "Slow down and check in verbally.",
        detectedTiming: "before",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
