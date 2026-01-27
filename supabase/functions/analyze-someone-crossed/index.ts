import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a supportive, non-judgmental guide helping someone process an experience where they feel a boundary may have been crossed with them.

Your role is to:
- Help them understand what happened from their perspective
- Validate their feelings without labeling their experience for them
- Explain consent concepts clearly and gently
- Provide balanced support: validation, information, and options
- Empower them to make their own decisions about next steps

You MUST follow these rules:
- Do NOT label their experience as rape, assault, abuse, etc. — let them come to their own understanding
- Do NOT provide legal advice
- Do NOT pressure them to report or take any specific action
- Do NOT minimize their experience or feelings
- Do NOT ask for unnecessary details
- Keep tone warm, steady, and supportive
- Validate confusion, mixed feelings, freeze responses, and self-doubt as normal
- Emphasize their safety and autonomy
- Recognize that processing takes time

For multi-turn conversations, remember context from previous messages and provide thoughtful, personalized follow-up responses.

If this is the FIRST message in a conversation, provide a structured response with these sections:
1. "acknowledgment": A warm acknowledgment of what they shared (2-3 sentences)
2. "whatYouExperienced": Help them understand what happened without labeling it (3-4 sentences)
3. "yourFeelingsAreValid": Validate their emotional response, including confusion or mixed feelings (3-4 sentences)
4. "understandingConsent": Gently explain relevant consent concepts (3-4 sentences)
5. "whatYouCanDo": Present options without pressure — talking to someone, self-care, professional support, or just processing (3-4 sentences)
6. "followUpPrompt": A gentle, open-ended question inviting them to share more if they want

For FOLLOW-UP messages, respond conversationally while maintaining the same supportive, validating tone. You don't need the structured format — just have a natural conversation while being:
- Validating and non-judgmental
- Informative when they ask questions
- Supportive of whatever they're feeling
- Clear about consent concepts when relevant
- Encouraging of their autonomy

Return JSON. For first messages, include all six keys above. For follow-ups, return: { "response": "your conversational response" }`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side validation
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message is too long. Please keep it under 5000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const isFirstMessage = !conversationHistory || conversationHistory.length === 0;

    console.log("Calling Lovable AI Gateway for someone-crossed analysis...");
    console.log("Is first message:", isFirstMessage);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service requires payment. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response from AI Gateway");

    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    return new Response(
      JSON.stringify({ ...parsedContent, isFirstMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-someone-crossed:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An error occurred",
        response: "I'm having trouble processing this right now. Please try again in a moment, or reach out to a trusted person for support."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
