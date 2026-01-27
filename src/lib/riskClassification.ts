import type { RiskLevel } from "@/data/scenarios";

export interface DecisionState {
  intent: string | null;
  consentSignal: string | null;
  contextFactors: string[];
}

export interface RiskClassification {
  level: RiskLevel;
  stopMessage: string;
  reasoning: string;
}

// Hard-coded rules for risk classification - the LLM does NOT determine this
export function classifyRisk(decisions: DecisionState): RiskClassification {
  const { intent, consentSignal, contextFactors } = decisions;
  
  // RED FLAG conditions - immediate stop
  if (consentSignal === "said-no") {
    return {
      level: "red",
      stopMessage: "Stop. They said no or pulled away. That's a clear answer.",
      reasoning: "An explicit 'no' or physical withdrawal is an unambiguous boundary."
    };
  }
  
  // No response escalates based on intent
  if (consentSignal === "no-response") {
    if (intent === "go-to-their-place" || intent === "invite-to-mine" || intent === "physical-move") {
      return {
        level: "red",
        stopMessage: "Do not proceed. No response is not consent.",
        reasoning: "Silence or lack of response to physical advances is not permission."
      };
    }
    return {
      level: "yellow",
      stopMessage: "Pause. No response means you don't have a green light yet.",
      reasoning: "Without a clear positive signal, continuing risks crossing a boundary."
    };
  }
  
  // Mixed signals + escalating intent = red
  if (consentSignal === "mixed-signals") {
    if (intent === "go-to-their-place" || intent === "invite-to-mine" || intent === "physical-move") {
      return {
        level: "red",
        stopMessage: "Do not make a physical move with mixed signals. Check in verbally first.",
        reasoning: "Mixed signals require verbal clarification before any physical escalation."
      };
    }
    return {
      level: "yellow",
      stopMessage: "Mixed signals mean you need to check in before going further.",
      reasoning: "Unclear signals require direct communication, not assumption."
    };
  }
  
  // Context factors escalate risk
  const hasAlcohol = contextFactors.includes("alcohol");
  const hasPowerImbalance = contextFactors.includes("power-imbalance");
  const hasAgeImbalance = contextFactors.includes("age-imbalance");
  const hasEmotionalPressure = contextFactors.includes("emotional-pressure");
  const hasExperienceGap = contextFactors.includes("experience-gap");
  
  const riskFactorCount = contextFactors.filter(f => f !== "none").length;
  
  // Alcohol + physical intent = always red
  if (hasAlcohol && (intent === "go-to-their-place" || intent === "invite-to-mine" || intent === "physical-move")) {
    return {
      level: "red",
      stopMessage: "Do not proceed when alcohol is involved. Consent requires clear judgment.",
      reasoning: "Alcohol impairs the ability to give meaningful consent."
    };
  }
  
  // Multiple risk factors = red
  if (riskFactorCount >= 2) {
    return {
      level: "red",
      stopMessage: "Too many factors that complicate consent. Pause and reassess.",
      reasoning: "Multiple complicating factors significantly increase the risk of harm."
    };
  }
  
  // Single risk factor with physical intent = yellow
  if (riskFactorCount === 1 && (intent === "go-to-their-place" || intent === "invite-to-mine" || intent === "physical-move")) {
    return {
      level: "yellow",
      stopMessage: "This situation has complications. Check in verbally before proceeding.",
      reasoning: "Context factors require extra care and explicit verbal consent."
    };
  }
  
  // Clear positive signals with no risk factors
  if ((consentSignal === "clear-yes" || consentSignal === "enthusiastic-actions") && riskFactorCount === 0) {
    return {
      level: "green",
      stopMessage: "",
      reasoning: "You have clear positive signals and no complicating factors."
    };
  }
  
  // Clear positive but has a risk factor
  if ((consentSignal === "clear-yes" || consentSignal === "enthusiastic-actions") && riskFactorCount > 0) {
    return {
      level: "yellow",
      stopMessage: "You have positive signals, but context factors mean you should still check in verbally.",
      reasoning: "Even with positive signals, complicating factors require extra care."
    };
  }
  
  // Default to yellow for uncertainty
  return {
    level: "yellow",
    stopMessage: "When in doubt, slow down and check in verbally.",
    reasoning: "Uncertainty means you should seek clarity before proceeding."
  };
}

// Format user selections for the AI explanation
export function formatSelectionsForAI(decisions: DecisionState): string {
  const intentLabels: Record<string, string> = {
    "go-to-their-place": "Going to their place",
    "invite-to-mine": "Inviting them to my place",
    "keep-texting": "Continuing to text/message",
    "physical-move": "Making a physical move",
    "not-sure": "Unsure what to do next"
  };
  
  const signalLabels: Record<string, string> = {
    "clear-yes": "They gave a clear verbal yes",
    "enthusiastic-actions": "Enthusiastic body language/actions",
    "mixed-signals": "Mixed or unclear signals",
    "no-response": "No response from them",
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
  
  const lines = [
    `Intent: ${intentLabels[decisions.intent || ""] || "Not specified"}`,
    `Consent signals: ${signalLabels[decisions.consentSignal || ""] || "Not specified"}`,
    `Context factors: ${decisions.contextFactors.length > 0 
      ? decisions.contextFactors.map(f => factorLabels[f] || f).join(", ")
      : "None selected"}`
  ];
  
  return lines.join("\n");
}
