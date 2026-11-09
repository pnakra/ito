export interface PilotSessionRow {
  session_id: string;
  confidence_pre: number | null;
  confidence_post: number | null;
  outcome: string | null;
}

export interface PracticeCompletionRow {
  session_id: string;
  choice_value: string | null;
}

export const INTERVENTION_LABELS: Record<string, string> = {
  "stepped-in": "Stepped in or got help",
  "checked-on-them": "Checked on them",
  "told-someone": "Told someone who can act",
  "saved-messages": "Saved messages or details",
  "not-yet": "Nothing yet / not sure",
  "prefer-not-to-say": "Prefer not to say",
};

export function summarizeBystanderPilot(rows: PilotSessionRow[], completions: PracticeCompletionRow[]) {
  const validSessions = new Set(rows.map((row) => row.session_id));
  const confidencePairs = rows.filter((row) =>
    typeof row.confidence_pre === "number" && typeof row.confidence_post === "number"
  );
  const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const pre = average(confidencePairs.map((row) => row.confidence_pre as number));
  const post = average(confidencePairs.map((row) => row.confidence_post as number));

  const interventions = new Map<string, number>();
  for (const row of rows) {
    const outcome = row.outcome?.trim().toLowerCase();
    if (outcome) interventions.set(outcome, (interventions.get(outcome) ?? 0) + 1);
  }

  const validCompletions = completions.filter((row) => validSessions.has(row.session_id));
  const completedSessions = new Set(validCompletions.map((row) => row.session_id));
  const scenarios = new Map<string, number>();
  for (const row of validCompletions) {
    const scenario = row.choice_value?.trim() || "unknown";
    scenarios.set(scenario, (scenarios.get(scenario) ?? 0) + 1);
  }

  return {
    confidenceCount: confidencePairs.length,
    confidencePre: pre,
    confidencePost: post,
    confidenceDelta: pre !== null && post !== null ? post - pre : null,
    interventions,
    answeredOutcomes: [...interventions.values()].reduce((sum, count) => sum + count, 0),
    practiceCompletions: validCompletions.length,
    practiceSessions: completedSessions.size,
    scenarios,
  };
}
