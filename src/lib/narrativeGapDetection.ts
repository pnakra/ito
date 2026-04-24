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

export type QueryType = "encounter" | "relational" | "relational-lite" | "crisis" | "distress" | "out-of-scope";

interface GapDetectionResult {
  gaps: DetectedGap[];
  detectedTiming: "before" | "after" | "unclear";
  flagWords: ReturnType<typeof detectFlagWords>;
  hasMinimumSafetyContext: boolean;
  queryType: QueryType;
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

// ─── QUERY TYPE CLASSIFIER ────────────────────────────────────────────────────
// Runs before gap detection to determine whether this narrative is about
// a physical/sexual encounter, a relational dynamic, or something out of scope.
// This gates which follow-up questions are relevant to surface.

const ENCOUNTER_PATTERNS = [
  /\b(kiss|kissing|make\s*out|hook\s*up|hooking\s*up|sex|sexual|sleep\s*with|slept\s*with|touch(ed|ing)|physical|intimat|go\s*further|went\s*further|escalat|fool\s*around|fingering|oral|blow\s*job|hand\s*job|penetrat|naked|undress|clothes\s*off|in\s*bed\s*with|bedroom)\b/i,
];

const RELATIONAL_PATTERNS = [
  /\b(control(s|ling)?|jealous|possessive|manipulat|gaslight|cheating|cheated|flirting|simp(ing)?|friendzone|leading\s*me\s*on|talking\s*stage|situationship|post(ing)?|picture|photo|bikini|social\s*media|instagram|snapchat|dm|text(ing)?|message)\b/i,
  /\b(boyfriend|girlfriend|partner|crush|ex|talking\s*to|dating|relationship|breakup|broke\s*up|trust|boundaries|respect)\b/i,
];

// Signals that suggest no interpersonal situation at all
const OUT_OF_SCOPE_PATTERNS = [
  /\b(homework|test|exam|grade|school\s*work|assignment|essay|teacher\s*gave|class\s*project)\b/i,
  /\b(recipe|cook|food|workout|exercise|gym|diet|health|medical|doctor)\b/i,
  /\b(game|gaming|minecraft|fortnite|movie|show|anime|song|music|band)\b/i,
];

// Active crisis — warrants immediate warm redirect + 988 / Crisis Text Line
const CRISIS_PATTERNS = [
  /\b(want\s*to\s*die|wanna\s*die|wish\s*i\s*(was|were)\s*dead)\b/i,
  /\bkill\s*(my)?self\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(ending\s*(it|my\s*life)|end\s*it\s*all)\b/i,
  /\bno\s*reason\s*to\s*(live|be\s*here)\b/i,
  /\bdon'?t\s*want\s*to\s*(be\s*here|live)\b/i,
  /\b(fucking\s*)?(kill|murder)\s*me\b/i,
  /\bhurt\s*(my)?self\b/i,
  /\bcut\s*(my)?self\b/i,
  /\bself\s*harm\b/i,
];

// Emotional distress — not active crisis but clearly not a consent/dating question
const DISTRESS_PATTERNS = [
  /\bi('m|\s*am)\s*(so\s*)?(depressed|anxious|lonely|broken|numb|hopeless|worthless|devastated)\b/i,
  /\bi\s*think\s*i('m|\s*am)\s*depressed\b/i,
  /\b(can'?t\s*cope|can'?t\s*go\s*on|falling\s*apart|breaking\s*down)\b/i,
  /\b(thought\s*about|thinking\s*about)\s*(cutting|hurting\s*myself|self\s*harm)\b/i,
  /\bi\s*(just\s*)?(want|need)\s*a\s*(boyfriend|girlfriend|bf|gf)\b/i,
  /\bim\s+lonely\b/i,
  /\bi'?m\s+so\s+lonely\b/i,
];

// Relational-lite — relationship adjacent but clearly not a consent/encounter question
// (e.g. "will she think I'm a simp", "they ghosted me", "does he like me")
const RELATIONAL_LITE_PATTERNS = [
  /\bthink\s+i('?m|\s*am)\s*a?\s*simp\b/i,
  /\bsimp\s+(if|for|because)\b/i,
  /\bwill\s+(she|he|they)\s+think\b/i,
  /\b(haven'?t|hasn'?t)\s+texted?\s+back\b/i,
  /\bover\s*thinking\s+it\b/i,
  /\bghostd?\s+(me|after)\b/i,
  /\bidk\s+if\s+(he|she|they)\s+like[ds]?\s+me\b/i,
  /\b(does|do)\s+(he|she|they)\s+like\s+me\b/i,
];

export function classifyQueryType(text: string): QueryType {
  // Crisis: active mental health emergency — check first, always wins
  if (hasMatch(text, CRISIS_PATTERNS)) {
    return "crisis";
  }

  // Distress: emotional difficulty but not active crisis
  if (hasMatch(text, DISTRESS_PATTERNS) && !hasMatch(text, ENCOUNTER_PATTERNS) && !hasMatch(text, RELATIONAL_PATTERNS)) {
    return "distress";
  }

  // Out of scope: clearly not interpersonal/relationship territory
  if (hasMatch(text, OUT_OF_SCOPE_PATTERNS) && !hasMatch(text, ENCOUNTER_PATTERNS) && !hasMatch(text, RELATIONAL_PATTERNS)) {
    return "out-of-scope";
  }

  // Encounter: physical/sexual context signals present
  if (hasMatch(text, ENCOUNTER_PATTERNS)) {
    return "encounter";
  }

  // Relational-lite: relationship-adjacent but not a consent/encounter question
  // Check before full relational to catch "will she think I'm a simp" etc.
  if (hasMatch(text, RELATIONAL_LITE_PATTERNS) && !hasMatch(text, RELATIONAL_PATTERNS)) {
    return "relational-lite";
  }

  // Relational: interpersonal but no physical signals
  if (hasMatch(text, RELATIONAL_PATTERNS)) {
    return "relational";
  }

  // Default: treat as encounter so we don't under-ask safety questions
  // when the situation is ambiguous. Better to ask than miss something.
  return "encounter";
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const queryType = classifyQueryType(text);

  const gaps: DetectedGap[] = [];

  // Crisis/distress/out-of-scope/relational-lite: skip all gap questions, return early
  if (queryType === "out-of-scope" || queryType === "crisis" || queryType === "distress" || queryType === "relational-lite") {
    return {
      gaps: [],
      detectedTiming,
      flagWords,
      hasMinimumSafetyContext: false,
      queryType,
    };
  }

  // 1. Timing unclear — need to know before/after to route correctly
  // Applies to both encounter and relational queries
  if (detectedTiming === "unclear") {
    gaps.push({
      id: "timing",
      category: "clarification",
      question: "Is this something that might happen, or something that already happened?",
      priority: 1,
      safetyRelevant: true,
    });
  }

  // The questions below only apply to encounter-type queries.
  // Relational queries (control, jealousy, social dynamics) don't need
  // substance checks or physical momentum questions — asking them creates
  // confusing noise and produces false safety signals.
  if (queryType === "encounter") {
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
  }

  // Sort by priority
  gaps.sort((a, b) => a.priority - b.priority);

  // Limit to 2-4 questions max
  const selectedGaps = gaps.slice(0, 4);

  // Minimum safety context = we know timing + at least one consent signal
  // For relational queries, timing alone is enough to proceed
  const hasMinimumSafetyContext = queryType === "relational"
    ? detectedTiming !== "unclear"
    : detectedTiming !== "unclear" && hasMatch(text, CONSENT_SIGNAL_PATTERNS);

  return {
    gaps: selectedGaps,
    detectedTiming,
    flagWords,
    hasMinimumSafetyContext,
    queryType,
  };
}

/**
 * Detect if a narrative describes the user as a victim or as acknowledging perpetration.
 * Used for Supabase flagging only — does not change flow behavior.
 */
export type SubmissionFlag = "victim" | "perpetrator_acknowledgment" | null;

const VICTIM_PATTERNS = [
  /\bi('?m|\s*was)\s*(not\s*sure|unsure)\s*if\s*(i\s*was\s*)?pressured/i,
  /\b(he|she|they)\s*(pressured|forced|made)\s*me\b/i,
  /\bi\s*(was|got)\s*(sexually\s*)?(assaulted|raped|violated)\b/i,
  /\bi\s*think\s*i\s*was\s*(sexually\s*)?assaulted\b/i,
  /\bi\s*(didn'?t|did\s*not)\s*(want|consent)\s*(to\s*it|to\s*that|but)\b/i,
  /\bsomething\s*(was\s*done\s*to\s*me|happened\s*to\s*me)\b/i,
];

const PERPETRATOR_PATTERNS = [
  /\bi\s*think\s*i\s*(sexually\s*)?assaulted\b/i,
  /\bdid\s*i\s*(sexually\s*)?assault\b/i,
  /\bi('?m|\s*am)\s*not\s*sure\s*if\s*(what\s*i\s*did|i)\s*(was|is)\s*(okay|ok|right|wrong)/i,
  /\bi\s*(may\s*have|might\s*have|think\s*i)\s*(hurt|harmed|violated|assaulted)\s*(her|him|them|someone)\b/i,
];

export function detectSubmissionFlag(text: string): SubmissionFlag {
  if (VICTIM_PATTERNS.some(p => p.test(text))) return "victim";
  if (PERPETRATOR_PATTERNS.some(p => p.test(text))) return "perpetrator_acknowledgment";
  return null;
}
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
