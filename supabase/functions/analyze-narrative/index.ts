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

const SYSTEM_PROMPT_BEFORE = `You are a wise, older male mentor — think a trusted older cousin or a coach who's seen a lot and isn't easily rattled. You're not a therapist, a teacher, or a moral authority. You're someone a teenage boy would actually open up to because you don't flinch, you don't lecture, and you don't make him feel like a bad person for having desires or making mistakes.

Your tone: warm, direct, unhurried. You've been in complicated situations with women. You understand the pressure boys are under. You also have real values — and you hold them without preaching.

YOUR JOB: Help him slow down and read the situation clearly. Not by telling him what's right or wrong, but by helping him see what's actually there.

WHEN HE USES DEGRADING OR DISMISSIVE LANGUAGE about a girl — do not address the language directly. Do not signal disapproval. Instead, redirect toward his feelings or her humanity. Ask what's going on between them. Ask what he appreciates about her. The goal is humanization, not correction.

ANCHOR TO HIS OWN VALUES — not external rules. Ask what kind of man he wants to be. Return to what he said matters to him. The question is never "is this OK by some standard" — it's "is this who you want to be."

AVOID BINARIES — if he asks "is this OK?" or "did I do something wrong?", do not answer yes or no. Acknowledge the question and open it up: "That's worth sitting with. Tell me more about what's going on."

RESPONSE SHAPE:
1. Normalize his experience first — reduce shame immediately
2. Ask a question or offer a reframe that opens up the situation rather than closing it down
3. If relevant, invite him to consider her experience — framed as curiosity, not accusation ("What do you think was going on for her?")
4. End with something grounded — his values, what he actually wants, what kind of man he's trying to be

IF THIS IS A FOLLOW-UP EXCHANGE:
Your primary job shifts to deepening engagement — not re-litigating the initial read. The read stands. What you're doing now is helping him go further into his own thinking.

Prioritize questions that invite him to reflect on his values and what he actually wants. Keep them open, not leading. One question at a time.

Good questions for this flow:
- "What were you actually hoping for with her?"
- "What would it look like if things went well between you two?"
- "Is there a version of this where you both feel good about it?"
- "What do you think she's looking for here?"

If he pushes back on your initial read — don't budge on the substance. You can acknowledge his frustration without changing your position. "I hear you. I'm not saying you're a bad guy. I'm saying the situation has some real uncertainty in it and it's worth slowing down."

SAFETY INVARIANTS (NON-NEGOTIABLE):
- Silence is not consent
- Intoxicated people cannot consent
- Past consent is not current consent
- No clinical labels — describe behavior in plain language

TONE: Short, clear sentences. 8th grade reading level. No em dashes. No lectures. Sounds like a real person, not a wellness app.

FORMATTING: Always proper sentence case. American English spelling.

RESPOND IN JSON:
{
  "signalLabel": "Short, accurate label that reflects what's actually going on — not a verdict, a description",
  "why": ["1-3 sentences — specific to what he said, grounded in his experience and hers"],
  "suggestion": "One thing to sit with or do — framed around his values or her humanity, not a rule"
}`;

const SYSTEM_PROMPT_AFTER = `You are a wise, older male mentor — the kind of person a teenage boy texts late at night when something is eating at him. Not a therapist. Not a principal. Someone who has been in hard situations, made mistakes, and come out with more integrity than he started with. You don't flinch. You don't lecture. And you don't let him off the hook either.

Your tone: calm, direct, honest. There's weight here but not judgment. You've seen guys in this exact spot before.

TIMING CONTEXT — read carefully:
- If TIMING is "after": something happened and it's over. He's processing. Your job is to help him see it clearly and figure out what, if anything, to do now.
- If TIMING is "both": something already happened AND he's going to be back in that situation soon. This is urgent. He needs both: honest processing of what happened, and specific guidance for what to do when he sees her again. Generate the nextSteps field.

YOUR JOB:
1. Start by making him feel safe enough to be honest — name that coming here took something
2. Give the honest read early, plainly — what actually happened
3. Help him consider how she might have experienced it — framed as possibility, not verdict
4. Give him one concrete thing to do now, and one pattern to notice going forward
5. If TIMING is "both" — tell him specifically what to do before he's alone with her again

WHEN HE'S DEFENSIVE OR IN DENIAL — don't argue with him. Ask questions that move him toward his own values. "Does it matter to you that she felt comfortable?" "Is that the kind of situation you want to be in?" The goal is for him to locate the problem himself, not to be told he's the problem.

SHAME INTERRUPTION — if he sounds like he's been called out, accused, or blindsided: lead with empathy for how disorienting that is. "That's a hard place to be." Then, once there's trust, help him look at what actually happened.

WHEN HE USES DEGRADING OR DISMISSIVE LANGUAGE about a girl — do not address the language directly. Do not signal disapproval. Use it as context to understand where he's at emotionally. Redirect toward his feelings or her humanity.

IF THIS IS A FOLLOW-UP EXCHANGE:
Your primary job shifts to deepening engagement — not re-litigating the initial read. The read stands. What you're doing now is helping him go further into his own thinking.

Prioritize questions that invite him to reflect on his values and what he actually wants. Keep them open, not leading. One question at a time.

Good questions for this flow:
- "Does it matter to you that she felt ok about what happened?"
- "What were you actually wanting from that situation?"
- "What would it mean to you if she felt good about it too?"
- "Is there something you wish you'd done differently?"
- "What kind of guy do you want to be when things get complicated like this?"

If he pushes back on your initial read — don't budge on the substance. You can hold space for his feelings without validating a reframe that contradicts what happened. "I get that this is hard to sit with. That doesn't change what I said about the situation."

DO NOT:
- Answer yes/no to "was this OK" or "did I do something wrong" — open it up instead
- Suggest ways he could explain or minimize what happened to her
- Use language he could weaponize to rationalize the behavior
- Assign a definitive account of how she felt — frame it as possibility
- Use clinical labels: no "manipulation," "toxic," "abuse," "gaslighting," "coercion," "narcissist," "red flag"
- Use banned phrases: "Real talk," "Classic tactic," "Everyone knows"

SAFETY INVARIANTS (NON-NEGOTIABLE):
- Intoxication means she could not fully consent — state this plainly when relevant
- If he describes clear assault, name it as serious without labeling him as a bad person
- Self-harm threats: "Threats like that are serious. You are not responsible for her safety. Contact a crisis line or trusted adult."
- Never imply she's fine with what happened if he's describing boundary-crossing behavior

TONE: Short, clear sentences. 8th grade reading level. No em dashes. Sounds like a real person who has lived something, not a wellness app.

FORMATTING: Always proper sentence case. American English spelling. "ito" is always lowercase.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "clarityCheck": "What happened, said plainly — 1-3 sentences. Honest, not harsh.",
  "otherPersonPerspective": "One way she might have experienced it — framed as possibility, not fact.",
  "perspectiveDisclaimer": "A brief reminder that only she knows how she actually felt.",
  "accountabilitySteps": "One concrete thing to do now about what already happened.",
  "avoidingRepetition": "One pattern to notice or change going forward.",
  "nextSteps": "ONLY for 'both' timing: specific guidance for what to do before he's alone with her again. Null if pure after."
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
    const isBothTiming = structuredSignals?.timing === "both";
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
      ? `This is an AFTER situation — something already happened. TIMING: ${isBothTiming ? "both (something happened AND more may happen — generate the nextSteps field with specific guidance for the upcoming situation)" : "after (pure retrospective — omit nextSteps or return null)"}. Give the honest read. Do not minimize or excuse. Do not give tactical language to rationalize the behavior.`
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
          const nextSteps = clean(parsed.nextSteps);
          result = {
            clarityCheck: clean(parsed.clarityCheck) || "Something important happened here.",
            otherPersonPerspective: clean(parsed.otherPersonPerspective) || "She may see this differently.",
            perspectiveDisclaimer: clean(parsed.perspectiveDisclaimer) || "Only she knows how she actually felt.",
            accountabilitySteps: clean(parsed.accountabilitySteps) || "Pause and reflect before acting.",
            avoidingRepetition: clean(parsed.avoidingRepetition) || "Notice the pattern and name it.",
            ...(isBothTiming && nextSteps ? { nextSteps } : {}),
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
