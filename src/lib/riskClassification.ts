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
}

// Problematic words/phrases that indicate concerning attitudes
// This is a FAST first-pass - AI-powered detection catches nuanced patterns
// CRITICAL SAFETY: These patterns trigger IMMEDIATE risk escalation regardless of AI interpretation
const FLAG_WORDS: { pattern: RegExp; category: string; severity: "red" | "yellow" }[] = [
  // === IMMEDIATE RED FLAG (non-consensual indicators) ===
  { pattern: /\bshe\s*(was\s*)?asking\s*for\s*it\b/i, category: "victim blaming", severity: "red" },
  { pattern: /\bmeans?\s*yes\b/i, category: "dismissing boundaries", severity: "red" },
  { pattern: /\bwon'?t\s*remember\b/i, category: "exploitation", severity: "red" },
  { pattern: /\bpassed\s*out\b/i, category: "incapacitation", severity: "red" },
  { pattern: /\basleep\b/i, category: "incapacitation", severity: "red" },
  { pattern: /\bunconscious\b/i, category: "incapacitation", severity: "red" },
  // Tense-aware: only fire on present/future intoxication, not retrospective "we were drunk"
  { pattern: /\btoo\s*(drunk|wasted|high)\b/i, category: "incapacitation", severity: "red" },
  // Retrospective intoxication handled separately below (not an immediate red trigger)
  { pattern: /\bforce[d]?\b/i, category: "force", severity: "red" },
  { pattern: /\bmake\s*(her|him|them)\b.*\b(do|have|give)\b/i, category: "coercion", severity: "red" },
  { pattern: /\bhold\s*(her|him|them)\s*down\b/i, category: "force", severity: "red" },
  { pattern: /\bcan'?t\s*say\s*no\b/i, category: "coercion", severity: "red" },
  { pattern: /\bwon'?t\s*say\s*no\b/i, category: "coercion", severity: "red" },
  { pattern: /\bno\s*one\s*will\s*believe\b/i, category: "threat", severity: "red" },
  { pattern: /\bkeep\s*(it|this)\s*secret\b/i, category: "secrecy/coercion", severity: "red" },
  
  // === RED FLAG (derogatory/objectifying language — indicates harmful framing) ===
  { pattern: /\bslut\b/i, category: "derogatory label", severity: "red" },
  { pattern: /\bwhore\b/i, category: "derogatory label", severity: "red" },
  { pattern: /\bho[e]?\b/i, category: "derogatory label", severity: "red" },
  { pattern: /\bthot\b/i, category: "derogatory label", severity: "red" },
  { pattern: /\bskank\b/i, category: "derogatory label", severity: "red" },
  { pattern: /\beasy\b/i, category: "objectifying assumption", severity: "red" },
  { pattern: /\bgets\s*around\b/i, category: "objectifying assumption", severity: "red" },
  
  // === YELLOW FLAG (concerning attitudes) ===
  
  // Entitlement
  { pattern: /\bowes?\s*me\b/i, category: "entitlement", severity: "red" },
  { pattern: /\bdeserve\b/i, category: "entitlement", severity: "yellow" },
  { pattern: /\bfriend\s*zone[d]?\b/i, category: "entitlement", severity: "yellow" },
  { pattern: /\bnice\s*guy\b/i, category: "entitlement", severity: "yellow" },
  
  // Victim blaming / dismissing boundaries  
  { pattern: /\bplaying\s*hard\s*to\s*get\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bled\s*me\s*on\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bleading\s*me\s*on\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bteasing\s*me\b/i, category: "dismissing boundaries", severity: "yellow" },
  { pattern: /\bwanting\s*it\b/i, category: "dismissing boundaries", severity: "yellow" },
  
  // Secrecy/manipulation
  { pattern: /\bwon'?t\s*tell\b/i, category: "secrecy/manipulation", severity: "yellow" },
  { pattern: /\bnobody\s*will\s*know\b/i, category: "secrecy/manipulation", severity: "yellow" },
  { pattern: /\bout\s*of\s*(your|her|his|their)\s*league\b/i, category: "manipulation", severity: "yellow" },
  
  // Coercion/pressure
  { pattern: /\bjust\s*let\s*me\b/i, category: "coercion", severity: "yellow" },
  { pattern: /\bcome\s*on\b/i, category: "pressure", severity: "yellow" },
  { pattern: /\bdon'?t\s*be\s*(like\s*that|a\s*tease)\b/i, category: "pressure", severity: "yellow" },
  
  // === REPORTED PRESSURE (victim perspective — someone else doing it to them) ===
  { pattern: /\b(he|she|they)\s*kept\s*(pushing|asking|trying|pressuring)\b/i, category: "reported pressure", severity: "red" },
  { pattern: /\b(he|she|they)\s*wouldn'?t\s*(stop|take\s*no|listen|back\s*off|leave\s*me\s*alone)\b/i, category: "reported pressure", severity: "red" },
  { pattern: /\b(pressured|guilted|coerced|guilt(ed|\s*trip))\s*me\b/i, category: "reported pressure", severity: "red" },
  { pattern: /\b(made|forced|talked)\s*me\s*(into|to)\b/i, category: "reported pressure", severity: "red" },
  { pattern: /\b(wouldn'?t|won'?t|didn'?t)\s*(let\s*me\s*(leave|go|say\s*no|stop))\b/i, category: "reported pressure", severity: "red" },
  { pattern: /\bi\s*(said|told)\s*(no|stop|him|her|them)\s*(but|and)\s*(he|she|they)\s*(kept|continued|didn'?t\s*(stop|listen))\b/i, category: "reported boundary violation", severity: "red" },
];

// Detect flag words in additional context
// Returns both the flagged categories and the highest severity level found
export function detectFlagWords(text: string): { categories: string[]; hasRedFlag: boolean } {
  if (!text?.trim()) return { categories: [], hasRedFlag: false };
  
  const flagged: string[] = [];
  let hasRedFlag = false;
  
  for (const { pattern, category, severity } of FLAG_WORDS) {
    if (pattern.test(text)) {
      if (!flagged.includes(category)) {
        flagged.push(category);
      }
      if (severity === "red") {
        hasRedFlag = true;
      }
    }
  }
  return { categories: flagged, hasRedFlag };
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
  const hasFlagWords = flaggedWords.length > 0;
  const hasImmediateRedFlag = flagResult.hasRedFlag;
  
  const isPhysicalMomentum = hasPhysicalMomentum(momentum);
  
  // CRITICAL SAFETY: Immediate red flag from keyword triggers - NO AI interpretation
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
  
  // Flag words with physical momentum = automatic red
  if (hasFlagWords && isPhysicalMomentum) {
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
        stopMessage: "Do not escalate physically with mixed signals. Check in verbally first.",
        reasoning: "Mixed signals require verbal clarification before any physical escalation.",
        flaggedWords
      };
    }
    // Flag words escalate mixed signals to red
    if (hasFlagWords) {
      return {
        level: "red",
        stopMessage: "Stop. Mixed signals plus concerning assumptions is a red flag.",
        reasoning: "The way you're interpreting this situation needs to be reconsidered.",
        flaggedWords
      };
    }
    return {
      level: "yellow",
      stopMessage: "Mixed signals mean you need to check in before going further.",
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
  
  // Flag words alone escalate to yellow minimum
  if (hasFlagWords) {
    return {
      level: "yellow",
      stopMessage: "Pause. Some of how you're thinking about this needs to be addressed.",
      reasoning: "Your framing includes assumptions that could lead to harm.",
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
  
  if (flaggedWords && flaggedWords.length > 0) {
    lines.push(`\nFLAGGED: ${flaggedWords.join(", ")}`);
    lines.push("IMPORTANT: The user used problematic language/framing. Call out what they said directly without using system labels like 'FLAGGED' in your response.");
  }
  
  return lines.join("\n");
}
