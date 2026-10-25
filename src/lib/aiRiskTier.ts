// AI second opinion on the risk tier (Oct 25 2026).
// The deterministic rules in riskClassification.ts run first. On the 300-scenario v9 eval suite
// they scored only 30 of 91 red scenarios as red, because most red situations use no flag words.
// The classify-risk edge function reads the narrative and returns green / yellow / red.
// combineRisk() lets it RAISE a result to red. It never lowers a red.
// Lowering the rules' generic default yellow to green is supported but OFF (ALLOW_AI_GREEN):
// on the eval suite it would also have lowered 29 of 126 yellow scenarios, so it needs review first.
// If the call fails or takes longer than the timeout, the rules' result stands unchanged.
import { supabase } from "@/integrations/supabase/client";
import type { RiskLevel } from "@/types/risk";

export type AiRiskTier = {
  tier: "green" | "yellow" | "red";
  confidence: number;
  categories: string[];
  reason: string;
} | null;

export const AI_RED_MIN_CONFIDENCE = 80;
export const ALLOW_AI_GREEN = false;
export const AI_GREEN_MIN_CONFIDENCE = 90;
const DEFAULT_YELLOW_REASONING = "Uncertainty means you should seek clarity before proceeding.";

export async function fetchAiRiskTier(text: string, timeoutMs = 4000): Promise<AiRiskTier> {
  try {
    const call = supabase.functions.invoke("classify-risk", { body: { text } });
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const res = (await Promise.race([call, timeout])) as { data?: Record<string, unknown> | null } | null;
    const d = res?.data;
    if (!d || (d.tier !== "green" && d.tier !== "yellow" && d.tier !== "red")) return null;
    return {
      tier: d.tier as "green" | "yellow" | "red",
      confidence: Number(d.confidence) || 0,
      categories: Array.isArray(d.categories) ? (d.categories as string[]) : [],
      reason: typeof d.reason === "string" ? d.reason : "",
    };
  } catch {
    return null;
  }
}

export function combineRisk(
  rules: { level: RiskLevel; reasoning: string; flaggedWords?: string[] },
  ai: AiRiskTier,
  opts: { textIsOriginal: boolean; queryType?: string },
): { level: RiskLevel; source: "rules" | "ai-raise" | "ai-lower" } {
  if (!ai) return { level: rules.level, source: "rules" };
  if (rules.level === "red") return { level: "red", source: "rules" };
  // Crisis and distress have their own screens; never re-route them.
  if (opts.queryType === "crisis" || opts.queryType === "distress") return { level: rules.level, source: "rules" };
  if (ai.tier === "red" && ai.confidence >= AI_RED_MIN_CONFIDENCE) return { level: "red", source: "ai-raise" };
  if (
    ALLOW_AI_GREEN &&
    opts.textIsOriginal &&
    rules.level === "yellow" &&
    rules.reasoning === DEFAULT_YELLOW_REASONING &&
    (rules.flaggedWords?.length ?? 0) === 0 &&
    ai.tier === "green" &&
    ai.confidence >= AI_GREEN_MIN_CONFIDENCE
  ) {
    return { level: "green", source: "ai-lower" };
  }
  return { level: rules.level, source: "rules" };
}
