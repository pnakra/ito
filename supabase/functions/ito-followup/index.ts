import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CONVERSATIONAL FOLLOW-UP PROMPT
// This is NOT a reassessment. It's a back-and-forth conversation.
// The AI should:
// 1. Ask clarifying questions like a good friend would
// 2. Acknowledge corrections or new info from the user
// 3. Respond in plain text, NOT structured JSON
// 4. Keep it short and conversational

const SYSTEM_PROMPT = `You are "is this ok?" — a calm, supportive friend helping someone think through a situation.

CONTEXT: The user already got an initial assessment. Now they want to continue the conversation — maybe to clarify something, correct a misunderstanding, or share more details.

YOUR JOB:
1. Listen to what they're saying
2. If something was unclear or you got it wrong, acknowledge that simply
3. Ask follow-up questions to understand better — like a good friend would
4. Keep responses SHORT — 2-4 sentences max, plus a question if relevant
5. Don't repeat the full assessment. This is a conversation, not a new diagnosis.

TONE:
- Talk like a calm friend, not a teacher or therapist
- Simple, short sentences
- 8th grade reading level
- Avoid em dashes
- Use "they/them" for the other person

EXAMPLES OF GOOD FOLLOW-UP QUESTIONS:
- "What happened when you said that?"
- "How did they respond?"
- "What made you feel that way?"
- "Has this happened before with them?"
- "What do you think they meant by that?"

IMPORTANT:
- NEVER give permission or approval
- If they share something concerning, gently note it
- If they're trying to rationalize, softly push back
- Keep the focus on observations, not judgments
- You can update your understanding based on new info

Respond in plain conversational text. No JSON, no bullet points, no structured format.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, initialContext, riskLevel } = await req.json();

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side input validation
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message is too long. Please keep it under 5000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    // Build messages array for Claude
    const messages: Message[] = [];
    
    // Add initial context as first user message if this is the first follow-up
    if (conversationHistory.length === 0 && initialContext) {
      messages.push({
        role: "user",
        content: `[Initial situation shared by user]\n${initialContext}\n\n[Risk level assigned: ${riskLevel || "unknown"}]`
      });
      messages.push({
        role: "assistant", 
        content: "I hear you. What else is on your mind about this?"
      });
    }
    
    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push(msg);
    }
    
    // Add current message
    messages.push({ role: "user", content: message });

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400, // Keep responses short
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await resp.text();
      console.error("Anthropic API error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const responseText = data?.content?.[0]?.text ?? "";

    return new Response(JSON.stringify({ response: responseText.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in vibecheck-followup function:", error);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        response: "I'm having trouble right now. Can you try again?",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

