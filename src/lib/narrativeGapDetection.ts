/**
 * Rule-based gap detection for narrative intake.
 * Detects missing safety-critical context and generates follow-up questions.
 * AI polishes phrasing but rules determine WHAT to ask.
 */

import { detectFlagWords } from "./riskClassification";

export interface DetectedGap {
  id: string;
  category: "timing" | "consent-signal" | "substances" | "power-dynamic" | "age" | "clarification";
  question: string;
  priority: number; // lower = more important
  safetyRelevant: boolean; // true = feeds into deterministic safety rules
}

interface GapDetectionResult {
  gaps: DetectedGap[];
  detectedTiming: "before" | "after" | "unclear";
  flagWords: ReturnType<typeof detectFlagWords>;
  hasMinimumSafetyContext: boolean;
}

// Timing detection patterns
const BEFORE_PATTERNS = [
  /\b(want|thinking about|going to|might|plan|considering|should i|can i|about to)\b/i,
  /\b(tonight|later|soon|next time|this weekend)\b/i,
  /\b(haven't|haven't yet|not yet|before it happens)\b/i,
];

const AFTER_PATTERNS = [
  /\b(already|happened|did|went|last night|yesterday|earlier|after)\b/i,
  /\b(regret|worried|feel bad|messed up|went too far|shouldn't have)\b/i,
  /\b(told me|said i|accused|confronted|upset with me)\b/i,
];

// Context detection patterns
const SUBSTANCE_PATTERNS = [
  /\b(drunk|wasted|high|drinking|alcohol|beer|wine|shots|buzzed|tipsy|stoned|drugs?|smoking|edibles?|molly|pills?)\b/i,
];

const AGE_MENTION_PATTERNS = [
  /\b(\d{1,2})\s*(years?\s*old|yo|y\.o\.?|yr)\b/i,
  /\b(teen|teenager|minor|underage|freshman|sophomore|junior|senior|college|high\s*school|middle\s*school)\b/i,
  /\b(older|younger|age\s*gap|age\s*difference)\b/i,
];

const POWER_PATTERNS = [
  /\b(boss|teacher|coach|professor|manager|supervisor|authority|mentor|tutor|counselor)\b/i,
  /\b(in charge|power|position|controls?|depends? on)\b/i,
];

const CONSENT_SIGNAL_PATTERNS = [
  /\b(said (yes|no|stop|don't|okay)|nodded|agreed|refused|pulled away|froze|went quiet|silent|didn't say anything|didn't respond)\b/i,
  /\b(enthusiastic|into it|wanted|didn't want|wasn't sure|hesitated|reluctant)\b/i,
];

const PHYSICAL_INTENT_PATTERNS = [
  /\b(kiss|sex|touch|hook\s*up|make\s*out|physical|intimat|sleep with|go further|escalat)\b/i,
];

function detectTiming(text: string): "before" | "after" | "unclear" {
  const lowerText = text.toLowerCase();
  let beforeScore = 0;
  let afterScore = 0;

  for (const pattern of BEFORE_PATTERNS) {
    if (pattern.test(lowerText)) beforeScore++;
  }
  for (const pattern of AFTER_PATTERNS) {
    if (pattern.test(lowerText)) afterScore++;
  }

  if (afterScore > beforeScore && afterScore >= 2) return "after";
  if (beforeScore > afterScore && beforeScore >= 1) return "before";
  return "unclear";
}

function hasMatch(text: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text));
}

export function detectGaps(narrativeText: string): GapDetectionResult {
  const text = narrativeText.trim();
  const flagWords = detectFlagWords(text);
  const detectedTiming = detectTiming(text);

  const gaps: DetectedGap[] = [];

  // 1. Timing unclear — need to know before/after to route correctly
  if (detectedTiming === "unclear") {
    gaps.push({
      id: "timing",
      category: "clarification",
      question: "Is this something that might happen, or something that already happened?",
      priority: 1,
      safetyRelevant: true,
    });
  }

  // 2. No consent signals mentioned
  if (!hasMatch(text, CONSENT_SIGNAL_PATTERNS)) {
    gaps.push({
      id: "consent-signal",
      category: "consent-signal",
      question: detectedTiming === "before"
        ? "How are they responding so far? Have they said or shown anything about how they feel?"
        : "How did they respond when it happened?",
      priority: 2,
      safetyRelevant: true,
    });
  }

  // 3. No substance mention but physical context detected
  if (!hasMatch(text, SUBSTANCE_PATTERNS) && hasMatch(text, PHYSICAL_INTENT_PATTERNS)) {
    gaps.push({
      id: "substances",
      category: "substances",
      question: "Quick check — is anyone drinking or using anything?",
      priority: 3,
      safetyRelevant: true, // Feeds into deterministic "alcohol + physical = red"
    });
  }

  // 4. No age context
  if (!hasMatch(text, AGE_MENTION_PATTERNS)) {
    gaps.push({
      id: "age",
      category: "age",
      question: "How old are you both? Roughly is fine.",
      priority: 4,
      safetyRelevant: true, // Age gap triggers deterministic rules
    });
  }

  // 5. Power dynamic not mentioned but might be relevant
  if (!hasMatch(text, POWER_PATTERNS) && hasMatch(text, PHYSICAL_INTENT_PATTERNS)) {
    gaps.push({
      id: "power-dynamic",
      category: "power-dynamic",
      question: "Is there any kind of power difference here? Like one of you being older, in charge, or more experienced?",
      priority: 5,
      safetyRelevant: true,
    });
  }

  // Sort by priority
  gaps.sort((a, b) => a.priority - b.priority);

  // Limit to 2-4 questions max
  const selectedGaps = gaps.slice(0, 4);

  // Minimum safety context = we know timing + at least one consent signal
  const hasMinimumSafetyContext =
    detectedTiming !== "unclear" &&
    hasMatch(text, CONSENT_SIGNAL_PATTERNS);

  return {
    gaps: selectedGaps,
    detectedTiming,
    flagWords,
    hasMinimumSafetyContext,
  };
}

/**
 * Maps narrative + follow-up answers into a DecisionState-like structure
 * that classifyRisk() can consume.
 */
export function narrativeToDecisionState(
  cumulativeText: string,
  detectedTiming: "before" | "after" | "unclear"
) {
  const text = cumulativeText.toLowerCase();

  // Map consent signals — IMPORTANT: distinguish user's own boundaries from other person's signals
  // "I don't want X" = user setting their OWN boundary (healthy, not "said-no")
  // "They said no" / "They pulled away" = OTHER person refusing (said-no)
  let consentSignal: string | null = null;
  
  // Other person explicitly refused or withdrew
  if (/\b(they|he|she)\s+(said\s+no|said\s+stop|pulled\s+away|refused|pushed\s+me\s+away)\b/i.test(text)) {
    consentSignal = "said-no";
  } else if (/\bsaid\s+(no|stop)\s+to\s+(me|him|her|them)\b/i.test(text)) {
    consentSignal = "said-no";
  // Other person went silent/non-responsive
  } else if (/\b(they|he|she)\s+(didn't say anything|went\s+quiet|froze|didn't respond|was\s+silent|stopped\s+responding)\b/i.test(text)) {
    consentSignal = "no-response";
  } else if (/\b(didn't say anything|silent|quiet|didn't respond|froze|frozen)\b/i.test(text) && !/\bi\s+(was|went|am|feel|felt)\s+(quiet|silent|frozen|froze)\b/i.test(text)) {
    consentSignal = "no-response";
  // Mixed signals from other person
  } else if (/\b(mixed|hard to tell|sometimes|not sure how they feel|confused about (their|his|her))\b/i.test(text)) {
    consentSignal = "mixed-signals";
  // Other person showing enthusiasm
  } else if (/\b(they|he|she)\s+(is|was|seems?|seemed)\s+(enthusiastic|into it|excited)\b/i.test(text) || /\b(said yes|agreed|nodded|asked me to)\b/i.test(text)) {
    consentSignal = "enthusiastic-actions";
  } else if (/\b(clear yes|explicitly|verbally agreed|told me to)\b/i.test(text)) {
    consentSignal = "clear-yes";
  }
  // NOTE: "I don't want X" / "I wasn't into it" = user's own feelings, NOT other person's consent signal
  // These are left as consentSignal = null, which defaults to yellow/uncertainty

  // Map context factors
  const contextFactors: string[] = [];
  // Tense-aware intoxication: retrospective mentions ("we were drunk", "I had been drinking")
  // in after-flow shouldn't auto-escalate the same way as present-tense
  const hasSubstances = hasMatch(text, SUBSTANCE_PATTERNS);
  const isRetrospective = detectedTiming === "after" || /\b(was|were|had been|got)\s+(drunk|wasted|high|drinking|tipsy|buzzed)\b/i.test(text);
  if (hasSubstances && !isRetrospective) {
    contextFactors.push("alcohol");
  } else if (hasSubstances && isRetrospective) {
    // Still flag as a factor but at lower weight — push "alcohol" only if combined with other red signals
    // Don't push it so classifyRisk doesn't auto-red from alcohol+physical alone
    contextFactors.push("emotional-pressure"); // maps to a context factor that won't auto-red with physical
  }
  if (hasMatch(text, POWER_PATTERNS)) contextFactors.push("age-imbalance");
  if (/\b(first time|never done|experience|virgin|new to)\b/i.test(text)) contextFactors.push("experience-gap");
  if (/\b(have to|obligated|owe|guilt|pressure|expected)\b/i.test(text)) contextFactors.push("emotional-pressure");
  if (contextFactors.length === 0) contextFactors.push("none");

  // Map momentum
  let momentum: string | null = null;
  if (hasMatch(text, PHYSICAL_INTENT_PATTERNS)) {
    if (/\b(slow down|wait|not sure|pause|step back)\b/i.test(text)) {
      momentum = "slow-down";
    } else {
      momentum = "toward-physical";
    }
  } else {
    momentum = "dont-know";
  }

  // Map orientation
  let orientation: string | null = null;
  if (detectedTiming === "after") {
    orientation = "already-happened";
  } else if (/\b(text|message|dm|chat|online)\b/i.test(text)) {
    orientation = "texting";
  } else if (/\b(party|group|friends|crowd)\b/i.test(text)) {
    orientation = "party-group";
  } else if (/\b(together|room|alone|in person|hanging out|at their|at my)\b/i.test(text)) {
    orientation = "in-person";
  } else {
    orientation = "not-sure";
  }

  return {
    orientation,
    consentSignal,
    contextFactors,
    momentum,
    additionalContext: cumulativeText,
  };
}
