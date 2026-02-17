import { supabase } from "./supabase";

type FlowType = "before" | "after-crossed" | "after-someone-crossed";
type StepType = "choice" | "freetext" | "ai_response";

// Generate a session ID that persists for the current page session
let currentSessionId: string | null = null;
let currentMessageIndex = 0;

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

    const { error } = await supabase.from("submissions").insert([
      {
        id: crypto.randomUUID(), // REQUIRED for your schema
        created_at: new Date().toISOString(), // ensure timestamp

        session_id: getSessionId(),
        flow_type: flowType,
        step_name: stepName,
        step_type: stepType,
        choice_value: choiceString || null,
        freetext_value: freetextValue || null,
        ai_response_summary: aiResponseSummary || null,
        metadata: metadata ?? {},
        message_index: getNextMessageIndex().toString()
      }
    ]);

    if (error) {
      console.error("Failed to log submission:", error);
    }
  } catch (err) {
    console.error("Submission logging error:", err);
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
