import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type FlowType = "before" | "after-crossed" | "after-someone-crossed";
type StepType = "choice" | "freetext" | "ai_response";

// Generate a session ID that persists for the current page session
let currentSessionId: string | null = null;

function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = crypto.randomUUID();
  }
  return currentSessionId;
}

export function resetSessionId(): void {
  currentSessionId = null;
}

interface LogSubmissionParams {
  flowType: FlowType;
  stepName: string;
  stepType: StepType;
  choiceValue?: string | string[];
  freetextValue?: string;
  aiResponseSummary?: string;
  metadata?: Json;
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

    const { error } = await supabase.from("submissions").insert([{
      session_id: getSessionId(),
      flow_type: flowType,
      step_name: stepName,
      step_type: stepType,
      choice_value: choiceString || null,
      freetext_value: freetextValue || null,
      ai_response_summary: aiResponseSummary || null,
      metadata: metadata ?? {}
    }]);

    if (error) {
      console.error("Failed to log submission:", error);
    }
  } catch (err) {
    // Fail silently - logging should never break the user experience
    console.error("Submission logging error:", err);
  }
}

// Convenience functions for common logging patterns
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
