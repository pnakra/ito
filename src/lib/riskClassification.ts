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
const FLAG_WORDS: { pattern: RegExp; category: string }[] = [
  // Derogatory labels
  { pattern: /\bslut\b/i, category: "derogatory label" },
  { pattern: /\bwhore\b/i, category: "derogatory label" },
  { pattern: /\bho\b/i, category: "derogatory label" },
  { pattern: /\bthot\b/i, category: "derogatory label" },
  { pattern: /\bskank\b/i, category: "derogatory label" },
  
  // Objectifying assumptions
  { pattern: /\beasy\b/i, category: "objectifying assumption" },
  { pattern: /\bgets\s*around\b/i, category: "objectifying assumption" },
  
  // Entitlement
  { pattern: /\bowes?\s*me\b/i, category: "entitlement" },
  { pattern: /\bdeserve\b/i, category: "entitlement" },
  { pattern: /\bfriend\s*zone[d]?\b/i, category: "entitlement" },
  { pattern: /\bnice\s*guy\b/i, category: "entitlement" },
  
  // Victim blaming / dismissing boundaries  
  { pattern: /\bshe\s*(was\s*)?asking\s*for\s*it\b/i, category: "victim blaming" },
  { pattern: /\bplaying\s*hard\s*to\s*get\b/i, category: "dismissing boundaries" },
  { pattern: /\bmeans?\s*yes\b/i, category: "dismissing boundaries" },
  { pattern: /\bled\s*me\s*on\b/i, category: "dismissing boundaries" },
  { pattern: /\bleading\s*me\s*on\b/i, category: "dismissing boundaries" },
  { pattern: /\bteasing\s*me\b/i, category: "dismissing boundaries" },
  { pattern: /\bwanting\s*it\b/i, category: "dismissing boundaries" },
  
  // Secrecy/manipulation
  { pattern: /\bwon'?t\s*tell\b/i, category: "secrecy/manipulation" },
  { pattern: /\bnobody\s*will\s*know\b/i, category: "secrecy/manipulation" },
  { pattern: /\bout\s*of\s*(your|her|his|their)\s*league\b/i, category: "manipulation" },
  
  // Coercion/pressure
  { pattern: /\bjust\s*let\s*me\b/i, category: "coercion" },
  { pattern: /\bcome\s*on\b/i, category: "pressure" },
  { pattern: /\bdon'?t\s*be\s*(like\s*that|a\s*tease)\b/i, category: "pressure" },
];

// Detect flag words in additional context
export function detectFlagWords(text: string): string[] {
  if (!text?.trim()) return [];
  
  const flagged: string[] = [];
  for (const { pattern, category } of FLAG_WORDS) {
    if (pattern.test(text)) {
      // Extract the matched word
      const match = text.match(pattern);
      if (match && !flagged.includes(category)) {
        flagged.push(category);
      }
    }
  }
  return flagged;
}

// Check if momentum indicates physical intent
function hasPhysicalMomentum(momentum: string | null): boolean {
  return momentum === "toward-physical";
}

// Hard-coded rules for risk classification - the LLM does NOT determine this
export function classifyRisk(decisions: DecisionState): RiskClassification {
  const { consentSignal, contextFactors, momentum, additionalContext } = decisions;
  
  // Check for flag words in free text
  const flaggedWords = detectFlagWords(additionalContext);
  const hasFlagWords = flaggedWords.length > 0;
  
  const isPhysicalMomentum = hasPhysicalMomentum(momentum);
  
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
