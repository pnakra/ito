import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// DETERMINISTIC CLASSIFIER (ported from src/lib/riskClassification.ts)
// =============================================================================

const FLAG_WORDS: { pattern: RegExp; category: string; severity: "red" | "yellow" }[] = [
  // RED FLAGS
  { pattern: /\bshe\s*(was\s*)?asking\s*for\s*it\b/i, category: "victim blaming", severity: "red" },
  { pattern: /\bmeans?\s*yes\b/i, category: "dismissing boundaries", severity: "red" },
  { pattern: /\bwon'?t\s*remember\b/i, category: "exploitation", severity: "red" },
  { pattern: /\bpassed\s*out\b/i, category: "incapacitation", severity: "red" },
  { pattern: /\basleep\b/i, category: "incapacitation", severity: "red" },
  { pattern: /\bunconscious\b/i, category: "incapacitation", severity: "red" },
  { pattern: /\btoo\s*(drunk|wasted|high)\b/i, category: "incapacitation", severity: "red" },
  { pattern: /\bforce[d]?\b/i, category: "force", severity: "red" },
  { pattern: /\bmake\s*(her|him|them)\b.*\b(do|have|give)\b/i, category: "coercion", severity: "red" },
  { pattern: /\bhold\s*(her|him|them)\s*down\b/i, category: "force", severity: "red" },
  { pattern: /\bcan'?t\s*say\s*no\b/i, category: "coercion", severity: "red" },
  { pattern: /\bwon'?t\s*say\s*no\b/i, category: "coercion", severity: "red" },
  { pattern: /\bno\s*one\s*will\s*believe\b/i, category: "threat", severity: "red" },
  { pattern: /\bkeep\s*(it|this)\s*secret\b/i, category: "secrecy/coercion", severity: "red" },
  { pattern: /\bowes?\s*me\b/i, category: "entitlement", severity: "red" },
  // YELLOW FLAGS
  { pattern: /\bslut\b/i, category: "derogatory label", severity: "yellow" },
  { pattern: /\bwhore\b/i, category: "derogatory label", severity: "yellow" },
  { pattern: /\bho\b/i, category: "derogatory label", severity: "yellow" },
  { pattern: /\bthot\b/i, category: "derogatory label", severity: "yellow" },
  { pattern: /\bskank\b/i, category: "derogatory label", severity: "yellow" },
  { pattern: /\beasy\b/i, category: "objectifying assumption", severity: "yellow" },
  { pattern: /\bgets\s*around\b/i, category: "objectifying assumption", severity: "yellow" },
  { pattern: /\bdeserve\b/i, category: "entitlement", severity: "yellow" },
  { pattern: /\bfriend\s*zone[d]?\b/i, category: "entitlement", severity: "yellow" },
  { pattern: /\bnice\s*guy\b/i, category: "entitlement", severity: "yellow" },
  { pattern: /\bplaying\s*hard\s*to\s*get\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bled\s*me\s*on\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bleading\s*me\s*on\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bteasing\s*me\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bwanting\s*it\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bwon'?t\s*tell\b/i, category: "secrecy/manipulation", severity: "yellow" },
  { pattern: /\bnobody\s*will\s*know\b/i, category: "secrecy/manipulation", severity: "yellow" },
  { pattern: /\bout\s*of\s*(your|her|his|their)\s*league\b/i, category: "manipulation", severity: "yellow" },
  { pattern: /\bjust\s*let\s*me\b/i, category: "coercion", severity: "yellow" },
  { pattern: /\bcome\s*on\b/i, category: "pressure", severity: "yellow" },
  { pattern: /\bdon'?t\s*be\s*(like\s*that|a\s*tease)\b/i, category: "pressure", severity: "yellow" },
];

// Additional heuristic patterns for raw text classification
const CONTEXT_PATTERNS = {
  intoxication: [
    /\b(drunk|wasted|hammered|plastered|buzzed|tipsy|high|stoned|rolling|tripping)\b/i,
    /\b(drinking|shots|beer|vodka|wine|edibles|smoked|smoking)\b/i,
  ],
  noConsent: [
    /\b(said\s*no|told\s*me\s*no|doesn'?t\s*want|didn'?t\s*want|refused|rejecting|not\s*interested)\b/i,
    /\b(pull(ed|ing)?\s*away|push(ed|ing)?\s*(me\s*)?away|flinch(ed|ing)?|froze|frozen)\b/i,
  ],
  silence: [
    /\b(not\s*respond|no\s*response|didn'?t\s*(say|respond|answer|reply)|silent|quiet|just\s*sat\s*there)\b/i,
    /\b(went\s*quiet|stopped\s*talking|didn'?t\s*react)\b/i,
  ],
  pressure: [
    /\b(keep\s*asking|asked\s*(again|multiple|several)|kept\s*trying|won'?t\s*give\s*up|persist)\b/i,
    /\b(convince|persuade|wear\s*(her|him|them)\s*down|change\s*(her|his|their)\s*mind)\b/i,
  ],
  selfHarm: [
    /\b(kill\s*(myself|themselves|himself|herself)|suicide|self.?harm|hurt\s*(myself|themselves))\b/i,
    /\b(threaten.*\b(hurt|kill|die|end\s*it))\b/i,
  ],
};

function classifyRawText(text: string): { riskLevel: "red" | "yellow" | "green"; flaggedWords: string[]; reasoning: string } {
  const flagged: string[] = [];
  let hasRedFlag = false;
  let hasYellowFlag = false;

  // Run regex flag words
  for (const { pattern, category, severity } of FLAG_WORDS) {
    if (pattern.test(text)) {
      if (!flagged.includes(category)) flagged.push(category);
      if (severity === "red") hasRedFlag = true;
      else hasYellowFlag = true;
    }
  }

  // Check context patterns
  const hasIntoxication = CONTEXT_PATTERNS.intoxication.some(p => p.test(text));
  const hasNoConsent = CONTEXT_PATTERNS.noConsent.some(p => p.test(text));
  const hasSilence = CONTEXT_PATTERNS.silence.some(p => p.test(text));
  const hasPressure = CONTEXT_PATTERNS.pressure.some(p => p.test(text));
  const hasSelfHarm = CONTEXT_PATTERNS.selfHarm.some(p => p.test(text));

  // Escalation rules
  if (hasRedFlag || hasNoConsent) {
    return { riskLevel: "red", flaggedWords: flagged, reasoning: "Explicit red flag or no-consent indicators detected." };
  }
  if (hasSelfHarm) {
    return { riskLevel: "red", flaggedWords: [...flagged, "self-harm reference"], reasoning: "Self-harm reference detected." };
  }
  if (hasIntoxication) {
    return { riskLevel: "red", flaggedWords: [...flagged, "intoxication"], reasoning: "Intoxication mentioned — consent cannot be meaningful." };
  }
  if (hasSilence || hasPressure) {
    return { riskLevel: "yellow", flaggedWords: [...flagged, ...(hasSilence ? ["silence/no response"] : []), ...(hasPressure ? ["pressure/persistence"] : [])], reasoning: "Silence or pressure patterns detected." };
  }
  if (hasYellowFlag) {
    return { riskLevel: "yellow", flaggedWords: flagged, reasoning: "Concerning language detected." };
  }

  return { riskLevel: "yellow", flaggedWords: [], reasoning: "Defaulting to yellow — raw text has inherent ambiguity." };
}

// =============================================================================
// EVAL ENDPOINT
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenarios } = await req.json();

    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      return new Response(JSON.stringify({ error: "Provide an array of { id, text } scenarios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap at 20 per batch to avoid timeouts
    const batch = scenarios.slice(0, 20);
    const results = [];

    for (const scenario of batch) {
      const { id, text } = scenario;
      if (!text?.trim()) {
        results.push({ id, error: "Empty text", riskLevel: null, response: null });
        continue;
      }

      // Step 1: Deterministic classification
      const classification = classifyRawText(text);

      // Step 2: Format as structured input (simulating onboarding output)
      const formattedScenario = [
        `Current situation: Not specified (eval from raw text)`,
        `What they're doing/saying: Not specified`,
        `Complicating factors: ${classification.flaggedWords.length > 0 ? classification.flaggedWords.join(", ") : "None detected"}`,
        `Direction this feels like it's heading: Not specified`,
        `\nAdditional context from the user:\n"${text.trim().slice(0, 3000)}"`,
        ...(classification.flaggedWords.length > 0 ? [
          `\nFLAGGED: ${classification.flaggedWords.join(", ")}`,
          `IMPORTANT: The user used problematic language/framing. Call out what they said directly without using system labels like 'FLAGGED' in your response.`
        ] : []),
      ].join("\n");

      // Step 3: Call analyze-ito with locked risk level
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
        
        const analyzeResp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-ito`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            scenario: formattedScenario,
            precomputedRiskLevel: classification.riskLevel,
          }),
        });

        const analyzeData = await analyzeResp.json();

        results.push({
          id,
          inputText: text.slice(0, 200) + (text.length > 200 ? "..." : ""),
          deterministicRisk: classification.riskLevel,
          deterministicReasoning: classification.reasoning,
          flaggedWords: classification.flaggedWords,
          aiResponse: analyzeData,
        });
      } catch (aiErr) {
        results.push({
          id,
          inputText: text.slice(0, 200) + (text.length > 200 ? "..." : ""),
          deterministicRisk: classification.riskLevel,
          deterministicReasoning: classification.reasoning,
          flaggedWords: classification.flaggedWords,
          aiResponse: null,
          error: `AI call failed: ${aiErr instanceof Error ? aiErr.message : String(aiErr)}`,
        });
      }
    }

    return new Response(JSON.stringify({ results, count: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in eval-ito:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
