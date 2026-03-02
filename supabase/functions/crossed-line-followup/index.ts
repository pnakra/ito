import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============================================================================
// SAFETY INVARIANTS (NON-NEGOTIABLE)
// These rules override all tone optimization or conversational flow.
// Violating any rule is considered a system failure.
// =============================================================================
// 1. NEVER imply permission or minimize what happened
// 2. NEVER normalize pressure, repeated asking, silence, intoxication, or power imbalance
// 3. Silence is NEVER consent - state explicitly when relevant
// 4. Intoxication INVALIDATES consent - state clearly when mentioned
// 5. Past consent does NOT imply present consent - state when referenced
// 6. NO judgment labels ("manipulation," "toxic," "red flag") - describe dynamics, not character
// 7. Self-harm threats: redirect to crisis resources, don't dismiss or assign responsibility
// 8. BANNED phrases: "Real talk," "Classic tactic," "Everyone knows," "That's a red flag"
// 9. Focus on ACCOUNTABILITY without shaming
// =============================================================================
// COPY CONSTRAINTS (NON-NEGOTIABLE)
// =============================================================================
// 1. NO clinical/diagnostic labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting"
// 2. Describe behavior/dynamics in PLAIN LANGUAGE instead
// 3. Describe what happened, NOT who they are
// 4. Self-harm: acknowledge seriousness, remove responsibility from user, redirect to support
// 5. NEVER assume intent behind threats
// =============================================================================

const SYSTEM_PROMPT = `You sound like a thoughtful older sibling continuing a conversation with someone who's been thinking through a situation where they might have crossed a boundary.

They've already seen the initial reflection. Now they want to keep talking.

YOUR JOB:
1. Answer what they're asking directly — insight by sentence 2 or 3
2. Keep the same calm, honest tone
3. Help them understand impact without shaming
4. 4-8 sentences unless more depth is clearly needed

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER minimize what happened or imply it was okay
- Silence is not consent.
- Someone drunk or high cannot give meaningful consent.
- What happened before does not give permission for now.
- NO clinical labels — describe behavior, not character
- Self-harm threats: redirect to crisis resources. "You are not responsible for their safety."
- BANNED: "Real talk," "Classic tactic," "Everyone knows," "That's a red flag"

TONE: Calm, direct, honest. Short sentences. 8th grade reading level. No em dashes. Slight naturalness > sounding polished.

RULES:
- No legal advice. No telling them to confess. No asking for sexual details. No roleplay.
- Suggest talking to a trusted adult if it seems serious.

Answer conversationally. Address their specific question.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 10, windowMs: 60000 });
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { message, conversationHistory, originalReflection } = await req.json();

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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    // Build messages array for Anthropic format
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Include original reflection context if provided
    if (originalReflection) {
      messages.push({
        role: "assistant",
        content: `Here's what we discussed earlier:\n\n**What might have happened:** ${originalReflection.clarityCheck}\n\n**How they might have felt:** ${originalReflection.otherPersonPerspective}\n\n**Patterns to notice:** ${originalReflection.yourPatterns}\n\n**What you can do now:** ${originalReflection.accountabilitySteps}\n\n**Going forward:** ${originalReflection.avoidingRepetition}`
      });
    }

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

    console.log("Calling Anthropic API for crossed-line followup...");
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response from Anthropic API");

    const content = data.content[0].text;

    return new Response(
      JSON.stringify({ response: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in crossed-line-followup:", error);
    return new Response(
      JSON.stringify({ 
        error: "Service temporarily unavailable",
        response: "I'm having trouble processing this right now. Please try again in a moment."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
