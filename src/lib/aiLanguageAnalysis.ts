import { invokeEdgeFunctionWithRetry } from "@/lib/invokeEdgeFunctionWithRetry";

export interface AILanguageAnalysis {
  hasConcerningLanguage: boolean;
  categories: string[];
  explanation: string | null;
  fallback?: boolean;
  error?: boolean;
}

/**
 * Analyzes text using AI to detect concerning language patterns
 * that static pattern matching might miss.
 * 
 * This is an enhancement layer - static detection still runs as first-pass.
 * If this fails, the system gracefully degrades to static-only detection.
 */
export async function analyzeLanguageWithAI(text: string): Promise<AILanguageAnalysis> {
  if (!text?.trim()) {
    return { hasConcerningLanguage: false, categories: [], explanation: null };
  }

  try {
    const data = await invokeEdgeFunctionWithRetry<AILanguageAnalysis>(
      "analyze-language",
      { text },
      { maxRetries: 2, baseDelayMs: 500, label: "analyze-language" },
    );

    return data as AILanguageAnalysis;
  } catch (err) {
    console.warn('AI language analysis error:', err);
    return { hasConcerningLanguage: false, categories: [], explanation: null, error: true };
  }
}

/**
 * Merges AI-detected categories with static-detected categories
 */
export function mergeFlagCategories(
  staticCategories: string[],
  aiAnalysis: AILanguageAnalysis
): string[] {
  const allCategories = new Set([
    ...staticCategories,
    ...(aiAnalysis.categories || [])
  ]);
  return Array.from(allCategories);
}
