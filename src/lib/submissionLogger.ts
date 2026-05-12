import { getAnonymousId } from "./anonymousId";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type FlowType = "before" | "after-crossed" | "after-someone-crossed";
type StepType = "choice" | "freetext" | "ai_response";

let currentSessionId: string | null = null;
let currentMessageIndex = 0;

// Capture ?src=...&pid=...&sid=... on first load and persist for the session
// so every submission can be tagged with its referral source (e.g. Prolific).
type ReferralMeta = { src?: string; pid?: string; sid?: string };
let referralMeta: ReferralMeta | null = null;

function getReferralMeta(): ReferralMeta {
  if (referralMeta) return referralMeta;
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem("referral_meta");
    if (stored) {
      referralMeta = JSON.parse(stored);
      return referralMeta!;
    }
    const params = new URLSearchParams(window.location.search);
    const meta: ReferralMeta = {};
    const src = params.get("src");
    const pid = params.get("pid");
    const sid = params.get("sid");
    if (src) meta.src = src;
    if (pid) meta.pid = pid;
    if (sid) meta.sid = sid;
    referralMeta = meta;
    sessionStorage.setItem("referral_meta", JSON.stringify(meta));
    return meta;
  } catch {
    return {};
  }
}

function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = crypto.randomUUID();
    currentMessageIndex = 0;
  }
  return currentSessionId;
}

export function resetSessionId(): void {
  currentSessionId = null;
  currentMessageIndex = 0;
}

function getNextMessageIndex(): number {
  return currentMessageIndex++;
}

interface LogSubmissionParams {
  flowType: FlowType;
  stepName: string;
  stepType: StepType;
  choiceValue?: string | string[];
  freetextValue?: string;
  aiResponseSummary?: string;
  metadata?: any;
}

export async function logSubmission({
  flowType,
  stepName,
  stepType,
  choiceValue,
  freetextValue,
  aiResponseSummary,
  metadata
}: LogSubmissionParams): Promise<void> {
  try {
    const choiceString = Array.isArray(choiceValue)
      ? choiceValue.join(", ")
      : choiceValue;

    const response = await fetch(
      `https://${PROJECT_ID}.supabase.co/functions/v1/log-submission`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          session_id: getSessionId(),
          flow_type: flowType,
          step_name: stepName,
          step_type: stepType,
          choice_value: choiceString || null,
          freetext_value: freetextValue || null,
          ai_response_summary: aiResponseSummary || null,
          metadata: { ...getReferralMeta(), ...(metadata ?? {}) },
          message_index: getNextMessageIndex(),
          anon_id: getAnonymousId(),
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error(`[submissionLogger] Failed (${response.status}):`, body);
    }
  } catch (err) {
    console.error("[submissionLogger] Network error:", err);
  }
}

// Convenience helpers
export function logChoice(
  flowType: FlowType,
  stepName: string,
  value: string | string[]
): Promise<void> {
  return logSubmission({
    flowType,
    stepName,
    stepType: "choice",
    choiceValue: value
  });
}

export function logFreetext(
  flowType: FlowType,
  stepName: string,
  value: string
): Promise<void> {
  return logSubmission({
    flowType,
    stepName,
    stepType: "freetext",
    freetextValue: value
  });
}

export function logAIResponse(
  flowType: FlowType,
  stepName: string,
  summary: string
): Promise<void> {
  return logSubmission({
    flowType,
    stepName,
    stepType: "ai_response",
    aiResponseSummary: summary
  });
}
