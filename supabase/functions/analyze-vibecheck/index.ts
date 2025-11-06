import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario } = await req.json();
    
    if (!scenario || !scenario.trim()) {
      return new Response(
        JSON.stringify({ error: 'Scenario text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    console.log('Analyzing scenario:', scenario.substring(0, 100) + '...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${SYSTEM_PROMPT}\n\nSCENARIO: ${scenario}\n\nRespond with ONLY the JSON, no other text.`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Anthropic response received');

    const responseText = data.content[0].type === 'text' ? data.content[0].text : '';
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-vibecheck function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        riskLevel: 'yellow',
        assessment: "We're having trouble analyzing this right now. Please try again.",
        whatsHappening: ["The system is temporarily unavailable"],
        whatNotToDo: ["Don't proceed if you're uncertain"],
        whatToDoInstead: ["Try submitting again in a moment"],
        realTalk: "When in doubt, slow down and communicate clearly."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
