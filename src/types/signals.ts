/**
 * Structured signal floor types for narrative intake.
 * These high-signal inputs dramatically improve safety classification and AI advice quality.
 */

export interface StructuredSignals {
  timing?: "already-happened" | "deciding" | "not-sure";
  physicalStage?: string[];
  ageUser?: string;
  ageOther?: string;
  intent?: string;
  relationship?: string;
}

export const TIMING_OPTIONS = [
  { value: "already-happened", label: "This already happened" },
  { value: "deciding", label: "I'm trying to decide what to do next" },
  { value: "not-sure", label: "Not sure" },
] as const;

export const PHYSICAL_STAGE_OPTIONS = [
  { value: "nothing-physical", label: "Nothing physical yet" },
  { value: "talking-flirting", label: "Talking / flirting" },
  { value: "holding-hands-cuddling", label: "Holding hands / cuddling" },
  { value: "kissed", label: "Kissed" },
  { value: "touching-over-clothes", label: "Touching over clothes" },
  { value: "touching-under-clothes", label: "Touching under clothes" },
  { value: "clothes-off-not-sex", label: "Clothes off but not sex" },
  { value: "sex", label: "Sex" },
] as const;

export const AGE_BAND_OPTIONS = [
  { value: "under-16", label: "Under 16" },
  { value: "16-17", label: "16–17" },
  { value: "18-24", label: "18–24" },
  { value: "25-plus", label: "25+" },
] as const;

export const INTENT_OPTIONS = [
  { value: "was-it-okay", label: "If something was okay" },
  { value: "what-to-do", label: "What to do next" },
  { value: "how-to-talk", label: "How to talk about it" },
  { value: "should-worry", label: "If I should be worried" },
  { value: "just-clarity", label: "Just want clarity" },
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: "friend", label: "Friend" },
  { value: "partner", label: "Partner / boyfriend / girlfriend" },
  { value: "dating", label: "Someone I'm dating" },
  { value: "older-person", label: "Someone older than me" },
  { value: "stranger", label: "Someone I don't know well" },
  { value: "other", label: "Other" },
] as const;

/**
 * Serialize structured signals into narrative text for the cumulative pipeline.
 * This preserves compatibility with existing classifyRisk() and AI analysis.
 */
export function serializeSignals(signals: StructuredSignals): string {
  const parts: string[] = [];

  if (signals.timing) {
    const label = TIMING_OPTIONS.find(o => o.value === signals.timing)?.label;
    if (label) parts.push(`Timing: ${label}`);
  }

  if (signals.relationship) {
    const label = RELATIONSHIP_OPTIONS.find(o => o.value === signals.relationship)?.label;
    if (label) parts.push(`The other person is: ${label}`);
  }

  if (signals.physicalStage && signals.physicalStage.length > 0) {
    const labels = signals.physicalStage
      .map(v => PHYSICAL_STAGE_OPTIONS.find(o => o.value === v)?.label)
      .filter(Boolean);
    if (labels.length > 0) {
      const prefix = signals.timing === "deciding"
        ? "What I'm thinking about"
        : "What's happened physically";
      parts.push(`${prefix}: ${labels.join(", ")}`);
    }
  }

  if (signals.ageUser) {
    const label = AGE_BAND_OPTIONS.find(o => o.value === signals.ageUser)?.label;
    if (label) parts.push(`My age: ${label}`);
  }

  if (signals.ageOther) {
    const label = AGE_BAND_OPTIONS.find(o => o.value === signals.ageOther)?.label;
    if (label) parts.push(`Their age: ${label}`);
  }

  if (signals.intent) {
    const label = INTENT_OPTIONS.find(o => o.value === signals.intent)?.label;
    if (label) parts.push(`What I want to figure out: ${label}`);
  }

  return parts.join("\n");
}

/**
 * Check which high-signal fields are missing from structured signals.
 * Returns the single highest-priority missing signal for confidence-aware clarification.
 */
export function getTopMissingSignal(signals: StructuredSignals): "timing" | "age" | "physical" | "intent" | null {
  if (!signals.timing) return "timing";
  if (!signals.ageUser && !signals.ageOther) return "age";
  if (!signals.physicalStage || signals.physicalStage.length === 0) return "physical";
  if (!signals.intent) return "intent";
  return null;
}
