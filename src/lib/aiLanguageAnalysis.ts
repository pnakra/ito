import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase.functions.invoke('analyze-language', {
      body: { text }
    });

    if (error) {
      console.warn('AI language analysis failed, using static detection only:', error);
      return { hasConcerningLanguage: false, categories: [], explanation: null, fallback: true };
    }

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
