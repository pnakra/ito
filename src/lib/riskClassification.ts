import type { RiskLevel } from "@/types/risk";

export interface DecisionState {
  orientation: string | null;
  consentSignal: string | null;
  contextFactors: string[];
  momentum: string | null;
  additionalContext: string;
}

export interface RiskClassification {
  level: RiskLevel;
  stopMessage: string;
  reasoning: string;
  flaggedWords?: string[];
  isCrisis?: boolean;
}

// Language patterns that indicate concerning attitudes or harmful framing.
// Split into two groups:
// - ESCALATING: these trigger immediate risk level changes (force, incapacitation, reported violations)
// - CONTEXTUAL: these are detected and passed silently to the AI as context, but do NOT escalate risk on their own
// This is a FAST first-pass — AI-powered detection catches nuanced patterns on top of this.

const FLAG_WORDS: { pattern: RegExp; category: string; severity: "red" | "yellow"; escalates: boolean }[] = [
  // === IMMEDIATE RED FLAG — escalating (non-consensual indicators) ===
  { pattern: /\bshe\s*(was\s*)?asking\s*for\s*it\b/i, category: "victim blaming", severity: "red", escalates: true },
  { pattern: /\bmeans?\s*yes\b/i, category: "dismissing boundaries", severity: "red", escalates: true },
  { pattern: /\bwon'?t\s*remember\b/i, category: "exploitation", severity: "red", escalates: true },
  { pattern: /\bpassed\s*out\b/i, category: "incapacitation", severity: "red", escalates: true },
  { pattern: /\basleep\b/i, category: "incapacitation", severity: "red", escalates: true },
  { pattern: /\bunconscious\b/i, category: "incapacitation", severity: "red", escalates: true },
  // Tense-aware: only fire on present/future intoxication, not retrospective "we were drunk"
  { pattern: /\btoo\s*(drunk|wasted|high)\b/i, category: "incapacitation", severity: "red", escalates: true },
  { pattern: /\bforce[d]?\b/i, category: "force", severity: "red", escalates: true },
  { pattern: /\bmake\s*(her|him|them)\b.*\b(do|have|give)\b/i, category: "coercion", severity: "red", escalates: true },
  { pattern: /\bhold\s*(her|him|them)\s*down\b/i, category: "force", severity: "red", escalates: true },
  { pattern: /\bcan'?t\s*say\s*no\b/i, category: "coercion", severity: "red", escalates: true },
  { pattern: /\bwon'?t\s*say\s*no\b/i, category: "coercion", severity: "red", escalates: true },
  { pattern: /\bno\s*one\s*will\s*believe\b/i, category: "threat", severity: "red", escalates: true },
  { pattern: /\bkeep\s*(it|this)\s*secret\b/i, category: "secrecy/coercion", severity: "red", escalates: true },

  // === SELF-HARM / CRISIS — escalating (life-safety) ===
  { pattern: /\bkill\s*(my)?self\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bwant\s*to\s*die\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bwish\s*i\s*(was|were)\s*dead\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bdon'?t\s*want\s*to\s*(be\s*here|live)\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bcut\s*(my)?self\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bhurt\s*(my)?self\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bsuicid(e|al)\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bending\s*(it|my\s*life)\b/i, category: "self-harm", severity: "red", escalates: true },
  { pattern: /\bno\s*reason\s*to\s*(live|be\s*here)\b/i, category: "self-harm", severity: "red", escalates: true },

  // === REPORTED PRESSURE — escalating (victim perspective) ===
  { pattern: /\b(he|she|they)\s*kept\s*(pushing|asking|trying|pressuring)\b/i, category: "reported pressure", severity: "red", escalates: true },
  { pattern: /\b(he|she|they)\s*wouldn'?t\s*(stop|take\s*no|listen|back\s*off|leave\s*me\s*alone)\b/i, category: "reported pressure", severity: "red", escalates: true },
  { pattern: /\b(pressured|guilted|coerced|guilt(ed|\s*trip))\s*me\b/i, category: "reported pressure", severity: "red", escalates: true },
  { pattern: /\b(made|forced|talked)\s*me\s*(into|to)\b/i, category: "reported pressure", severity: "red", escalates: true },
  { pattern: /\b(wouldn'?t|won'?t|didn'?t)\s*(let\s*me\s*(leave|go|say\s*no|stop))\b/i, category: "reported pressure", severity: "red", escalates: true },
  { pattern: /\bi\s*(said|told)\s*(no|stop|him|her|them)\s*(but|and)\s*(he|she|they)\s*(kept|continued|didn'?t\s*(stop|listen))\b/i, category: "reported boundary violation", severity: "red", escalates: true },

  // === CONTEXTUAL ONLY — detected and passed silently to AI, do NOT escalate risk ===
  // Derogatory/objectifying language — emotional context, not a consent violation signal on its own
  { pattern: /\bslut\b/i, category: "derogatory label", severity: "red", escalates: false },
  { pattern: /\bwhore\b/i, category: "derogatory label", severity: "red", escalates: false },
  { pattern: /\bho[e]?\b/i, category: "derogatory label", severity: "red", escalates: false },
  { pattern: /\bthot\b/i, category: "derogatory label", severity: "red", escalates: false },
  { pattern: /\bskank\b/i, category: "derogatory label", severity: "red", escalates: false },
  { pattern: /\beasy\b/i, category: "objectifying assumption", severity: "yellow", escalates: false },
  { pattern: /\bgets\s*around\b/i, category: "objectifying assumption", severity: "yellow", escalates: false },

  // Entitlement — attitudinal, handled through conversation not escalation
  { pattern: /\bowes?\s*me\b/i, category: "entitlement", severity: "yellow", escalates: false },
  { pattern: /\bdeserve\b/i, category: "entitlement", severity: "yellow", escalates: false },
  { pattern: /\bfriend\s*zone[d]?\b/i, category: "entitlement", severity: "yellow", escalates: false },
  { pattern: /\bnice\s*guy\b/i, category: "entitlement", severity: "yellow", escalates: false },

  // Dismissing boundaries — attitudinal
  { pattern: /\bplaying\s*hard\s*to\s*get\b/i, category: "dismissing boundaries", severity: "yellow", escalates: false },
  { pattern: /\bled\s*me\s*on\b/i, category: "dismissing boundaries", severity: "yellow", escalates: false },
  { pattern: /\bleading\s*me\s*on\b/i, category: "dismissing boundaries", severity: "yellow", escalates: false },
  { pattern: /\bteasing\s*me\b/i, category: "dismissing boundaries", severity: "yellow", escalates: false },
  { pattern: /\bwanting\s*it\b/i, category: "dismissing boundaries", severity: "yellow", escalates: false },

  // Secrecy/manipulation — attitudinal
  { pattern: /\bwon'?t\s*tell\b/i, category: "secrecy/manipulation", severity: "yellow", escalates: false },
  { pattern: /\bnobody\s*will\s*know\b/i, category: "secrecy/manipulation", severity: "yellow", escalates: false },
  { pattern: /\bout\s*of\s*(your|her|his|their)\s*league\b/i, category: "manipulation", severity: "yellow", escalates: false },

  // Pressure — attitudinal
  { pattern: /\bjust\s*let\s*me\b/i, category: "pressure", severity: "yellow", escalates: false },
  { pattern: /\bcome\s*on\b/i, category: "pressure", severity: "yellow", escalates: false },
  { pattern: /\bdon'?t\s*be\s*(like\s*that|a\s*tease)\b/i, category: "pressure", severity: "yellow", escalates: false },
];

// Detect flag words in additional context.
// Returns:
// - categories: all matched categories (both escalating and contextual)
// - hasRedFlag: true only if an ESCALATING red pattern was matched
// - contextualCategories: attitudinal/non-escalating matches for silent AI context
export function detectFlagWords(text: string): {
  categories: string[];
  hasRedFlag: boolean;
  contextualCategories: string[];
} {
  if (!text?.trim()) return { categories: [], hasRedFlag: false, contextualCategories: [] };

  const flagged: string[] = [];
  const contextual: string[] = [];
  let hasRedFlag = false;

  for (const { pattern, category, severity, escalates } of FLAG_WORDS) {
    if (pattern.test(text)) {
      if (!flagged.includes(category)) {
        flagged.push(category);
      }
      if (escalates && severity === "red") {
        hasRedFlag = true;
      }
      if (!escalates && !contextual.includes(category)) {
        contextual.push(category);
      }
    }
  }

  return { categories: flagged, hasRedFlag, contextualCategories: contextual };
}

// Check if momentum indicates physical intent
function hasPhysicalMomentum(momentum: string | null): boolean {
  return momentum === "toward-physical";
}

// Hard-coded rules for risk classification - the LLM does NOT determine this
export function classifyRisk(decisions: DecisionState): RiskClassification {
  const { consentSignal, contextFactors, momentum, additionalContext } = decisions;

  // Check for flag words in free text
  const flagResult = detectFlagWords(additionalContext);
  const flaggedWords = flagResult.categories;
  // Only escalating matches count toward risk logic
  const hasImmediateRedFlag = flagResult.hasRedFlag;
  // Escalating flag words only (not contextual-only)
  const hasEscalatingFlagWords = flaggedWords.filter(c =>
    FLAG_WORDS.some(f => f.category === c && f.escalates)
  ).length > 0;

  const isPhysicalMomentum = hasPhysicalMomentum(momentum);

  // CRITICAL SAFETY: Immediate red flag from escalating keyword triggers - NO AI interpretation
  if (hasImmediateRedFlag) {
    return {
      level: "red",
      stopMessage: "Stop. What you've described includes serious red flags that indicate harm.",
      reasoning: "Your description contains language associated with non-consensual or harmful behavior.",
      flaggedWords
    };
  }

  // RED FLAG conditions - immediate stop
  if (consentSignal === "said-no") {
    return {
      level: "red",
      stopMessage: "Stop. They said no or pulled away. That's a clear answer.",
      reasoning: "An explicit 'no' or physical withdrawal is an unambiguous boundary.",
      flaggedWords
    };
  }

  // Escalating flag words with physical momentum = automatic red
  if (hasEscalatingFlagWords && isPhysicalMomentum) {
    return {
      level: "red",
      stopMessage: "Stop. The way you're thinking about this situation is a problem.",
      reasoning: "Your framing suggests attitudes that don't respect the other person's autonomy.",
      flaggedWords
    };
  }

  // No response escalates based on momentum
  if (consentSignal === "no-response") {
    if (isPhysicalMomentum) {
      return {
        level: "red",
        stopMessage: "Do not proceed. No response is not consent.",
        reasoning: "Silence or lack of response to physical advances is not permission.",
        flaggedWords
      };
    }
    return {
      level: "yellow",
      stopMessage: "Pause. No response means you don't have a clear signal yet.",
      reasoning: "Without a clear positive signal, continuing risks crossing a boundary.",
      flaggedWords
    };
  }

  // Mixed signals + physical momentum = red
  if (consentSignal === "mixed-signals") {
    if (isPhysicalMomentum) {
      return {
        level: "red",
        stopMessage: "Do not escalate physically when signals are unclear. Check in verbally first.",
        reasoning: "Mixed signals require verbal clarification before any physical escalation.",
        flaggedWords
      };
    }
    // Only escalating flag words push mixed signals to red
    if (hasEscalatingFlagWords) {
      return {
        level: "red",
        stopMessage: "Stop. Mixed signals plus concerning assumptions is a red flag.",
        reasoning: "The way you're interpreting this situation needs to be reconsidered.",
        flaggedWords
      };
    }
    return {
      level: "yellow",
      stopMessage: "Mixed signals mean you should check in before going further.",
      reasoning: "Unclear signals require direct communication, not assumption.",
      flaggedWords
    };
  }

  // Context factors escalate risk
  const hasAlcohol = contextFactors.includes("alcohol");
  const riskFactorCount = contextFactors.filter(f => f !== "none").length;

  // Alcohol + physical momentum = always red
  if (hasAlcohol && isPhysicalMomentum) {
    return {
      level: "red",
      stopMessage: "Do not proceed when alcohol is involved. Consent requires clear judgment.",
      reasoning: "Alcohol impairs the ability to give meaningful consent.",
      flaggedWords
    };
  }

  // Multiple risk factors = red
  if (riskFactorCount >= 2) {
    return {
      level: "red",
      stopMessage: "Too many factors that complicate consent. Pause and reassess.",
      reasoning: "Multiple complicating factors significantly increase the risk of harm.",
      flaggedWords
    };
  }

  // Single risk factor with physical momentum = yellow
  if (riskFactorCount === 1 && isPhysicalMomentum) {
    return {
      level: "yellow",
      stopMessage: "This situation has complications. Check in verbally before proceeding.",
      reasoning: "Context factors require extra care and explicit verbal consent.",
      flaggedWords
    };
  }

  // Clear positive signals with no risk factors
  if ((consentSignal === "clear-yes" || consentSignal === "enthusiastic-actions") && riskFactorCount === 0) {
    return {
      level: "green",
      stopMessage: "",
      reasoning: "You have clear positive signals and no complicating factors.",
      flaggedWords
    };
  }

  // Clear positive but has a risk factor
  if ((consentSignal === "clear-yes" || consentSignal === "enthusiastic-actions") && riskFactorCount > 0) {
    return {
      level: "yellow",
      stopMessage: "You have positive signals, but context factors mean you should still check in verbally.",
      reasoning: "Even with positive signals, complicating factors require extra care.",
      flaggedWords
    };
  }

  // Default to yellow for uncertainty
  return {
    level: "yellow",
    stopMessage: "When in doubt, slow down and check in verbally.",
    reasoning: "Uncertainty means you should seek clarity before proceeding.",
    flaggedWords
  };
}

// Format user selections for the AI explanation
export function formatSelectionsForAI(decisions: DecisionState, flaggedWords?: string[], moveLabel?: string | null): string {
  const orientationLabels: Record<string, string> = {
    "texting": "We're texting or messaging",
    "in-person": "We're together in person",
    "party-group": "We're at a party or group setting",
    "already-happened": "Something already happened and I'm unsure",
    "not-sure": "I'm not sure how to describe it"
  };

  const signalLabels: Record<string, string> = {
    "clear-yes": "They gave a clear verbal yes or expressed interest in words",
    "enthusiastic-actions": "They're actively initiating or reciprocating",
    "mixed-signals": "Mixed or hard to read signals",
    "no-response": "Quiet or not responding",
    "said-no": "They said no or pulled away"
  };

  const factorLabels: Record<string, string> = {
    "alcohol": "Alcohol or drugs are involved",
    "experience-gap": "Significant experience gap",
    "age-imbalance": "Age or power imbalance",
    "emotional-pressure": "Emotional pressure present",
    "power-imbalance": "Power dynamic at play",
    "none": "No complicating factors"
  };

  const momentumLabels: Record<string, string> = {
    "toward-physical": "Heading toward something physical",
    "staying-flirty": "Staying flirty or emotional",
    "slow-down": "Wanting to slow things down",
    "dont-know": "Not sure where this is heading"
  };

  const lines = [];

  // Add the move context at the top if provided
  if (moveLabel) {
    lines.push(`Move being considered: ${moveLabel}`);
  }

  lines.push(
    `Current situation: ${orientationLabels[decisions.orientation || ""] || "Not specified"}`,
    `What they're doing/saying: ${signalLabels[decisions.consentSignal || ""] || "Not specified"}`,
    `Complicating factors: ${decisions.contextFactors.length > 0
      ? decisions.contextFactors.map(f => factorLabels[f] || f).join(", ")
      : "None selected"}`,
    `Direction this feels like it's heading: ${momentumLabels[decisions.momentum || ""] || "Not specified"}`
  );

  if (decisions.additionalContext?.trim()) {
    lines.push(`\nAdditional context from the user:\n"${decisions.additionalContext.trim()}"`);
  }

  // Attitudinal/contextual language is passed silently — do not call it out directly.
  // The AI uses this to understand where the user is emotionally and redirect toward humanization.
  if (flaggedWords && flaggedWords.length > 0) {
    lines.push(`\nLANGUAGE CONTEXT (do not reference directly): The user used language suggesting charged emotions or attitudes (${flaggedWords.join(", ")}). Use this as silent context to understand where he's at. Do not address the language. Redirect toward his feelings or her humanity.`);
  }

  return lines.join("\n");
}
