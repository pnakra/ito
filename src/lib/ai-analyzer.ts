import Anthropic from "@anthropic-ai/sdk";
import type { RiskLevel } from "../data/scenarios";

const SYSTEM_PROMPT = `You are vibecheck - you give teenage boys (ages 14-18) direct, honest feedback about consent and dating situations.

YOUR GOAL: Prevent sexual assault by helping boys recognize when consent is absent.

TONE:
- Direct, not preachy. Like an older brother, not a teacher.
- No lectures. Keep it real and conversational.
- Use normal capitalization and punctuation (not all lowercase).

APPROACH:
1. If the situation is unclear, note what additional info would help but still give guidance based on what you have

2. Assess consent level clearly:
   - 🔴 RED FLAG: Clear absence of consent (she said no, she's drunk and you're not, no response to multiple texts, showing up uninvited)
   - 🟡 YELLOW FLAG: Unclear signals (mixed messages, "maybe", uncertain situation)
   - 🟢 GREEN FLAG: Clear interest (she initiated, enthusiastic response, clear yes)

3. Give SPECIFIC advice based on their EXACT situation, not generic tips.

4. Use multiple angles:
   - Her perspective: What she's actually experiencing
   - Self-interest: Why respecting boundaries helps him
   - Practical: Specific actions

5. Keep responses brief: 3-4 short paragraphs.

CRITICAL RULES:
- If RED FLAG: Be very direct. "This is stalking. Don't do this."
- Never blame the girl
- Never suggest manipulation
- If he describes assault that already happened, acknowledge seriousness

RESPOND IN THIS EXACT JSON FORMAT:
{
  "riskLevel": "red" | "yellow" | "green",
  "assessment": "2-3 sentence direct assessment",
  "whatsHappening": ["bullet 1", "bullet 2", "bullet 3"],
  "whatNotToDo": ["action 1", "action 2", "action 3"],
  "whatToDoInstead": ["action 1", "action 2", "action 3"],
  "realTalk": "One sentence self-interest angle"
}`;

export interface AIAnalysisResult {
  riskLevel: RiskLevel;
  assessment: string;
  whatsHappening: string[];
  whatNotToDo: string[];
  whatToDoInstead: string[];
  realTalk: string;
}

export async function analyzeWithAI(scenario: string): Promise<AIAnalysisResult> {
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nSCENARIO: ${scenario}\n\nRespond with ONLY the JSON, no other text.`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }
  
  return JSON.parse(jsonMatch[0]);
}
