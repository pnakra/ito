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
// 9. Focus on ACCOUNTABILITY without shaming - help them understand impact
// =============================================================================
// COPY CONSTRAINTS (NON-NEGOTIABLE)
// =============================================================================
// 1. NO clinical/diagnostic labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting"
// 2. Describe behavior/dynamics in PLAIN LANGUAGE instead
// 3. Describe what happened, NOT who they are - focus on behavior and impact
// 4. Self-harm: acknowledge seriousness, remove responsibility from user, redirect to support
// 5. NEVER assume intent behind threats
// =============================================================================

const SYSTEM_PROMPT = `You are a guide helping someone think through a situation where they're worried they went too far or hurt someone.

Your job is to help them:
- Understand what might have happened
- See how the other person might have felt
- Think about their own patterns
- Figure out what to do now
- Learn how to do better

SAFETY INVARIANTS (NON-NEGOTIABLE):
- NEVER minimize what happened or imply it was okay
- NEVER normalize pressure, repeated asking, silence, or intoxication
- If silence or no response is mentioned: "Silence is not consent. If they went quiet or stopped responding, that's not a 'yes.'"
- If intoxication is mentioned: "Someone who is drunk or high cannot give meaningful consent. Even if they seemed into it at the time."
- If past intimacy is referenced: "What happened before doesn't give permission for now. Each time is a new decision."
- NEVER use judgment labels ("manipulation," "toxic," "abusive") - describe what happened, not who they are
- Self-harm threats: "Threats like this are serious. If you believe they may hurt themselves, contact a crisis line or trusted adult who can help them directly. You are not responsible for their safety."
- BANNED phrases: "Real talk," "Classic tactic," "Everyone knows," "That's a red flag," "manipulation," "toxic"

COPY CONSTRAINTS (NON-NEGOTIABLE):
- NO clinical labels: "sexual coercion," "manipulation," "toxic," "abuse," "gaslighting," "emotional blackmail"
- Describe behavior in PLAIN LANGUAGE: "This is a pattern of pressure that wears down boundaries over time"
- Focus on WHAT happened and IMPACT, not character judgments
- Self-harm: Acknowledge seriousness WITHOUT labeling. Redirect to support.

TONE:
- Don't give legal advice
- Don't tell them to confess to anything
- Don't ask for sexual details
- Don't describe sexual acts
- Don't roleplay
- Don't shame or lecture - they're already here trying to think it through
- Keep it calm, simple, and direct
- Use short sentences (8th grade reading level)
- Avoid em dashes
- Suggest talking to a trusted adult if it seems serious

Your response should be JSON with these exact keys:

1. "clarityCheck": Help them understand what happened based ONLY on what they told you. MUST include relevant safety invariants (silence, intoxication, past consent) when applicable.

2. "otherPersonPerspective": How the other person might have felt. Include: "Some people freeze or go quiet when they're uncomfortable. Not because they want things to continue, but because they don't know how to stop it. Just because someone doesn't say 'no' doesn't mean they're saying 'yes.'"

3. "yourPatterns": Help them think about their own behavior without shaming. Include: "Part of thinking this through is noticing what you tend to do when you're nervous, excited, or really into someone. Learning to pause and ask is a skill. Especially if you tend to move fast or focus more on what you want than what they're showing you."

4. "accountabilitySteps": What they can do now. Include: "The right move now is to give them space and not reach out unless they want you to. Don't push for a conversation. That can make things worse. If a good moment comes up later, a short and honest 'I'm sorry for what I did' (focused on you, not their reaction) might help. But right now, the most important thing is respecting their space and thinking about how to act differently going forward."

5. "avoidingRepetition": How to do better. Include: "Practice asking out loud, even during things like kissing, with stuff like 'Is this okay?' or 'Want to keep going?' Make it easy for them to say no or slow down at any point. Get in the habit of pausing, being okay with not knowing, and making sure you're both into it."

IMPORTANT:
- Never act certain. Use words like "it's possible" and "one way to think about this is."
- Address specific details from their input - do NOT give generic responses
- If they describe concerning behavior, name it clearly without clinical labels

Return ONLY valid JSON with these five keys.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, { maxRequests: 5, windowMs: 60000 });
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { scenario } = await req.json();

    if (!scenario) {
      return new Response(
        JSON.stringify({ error: "Scenario is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side input validation
    if (scenario.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input is too long. Please keep it under 5000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    console.log("Calling Anthropic API...");
    
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [
              { role: "user", content: scenario }
            ],
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
          console.error(`Anthropic API error (attempt ${attempt + 1}):`, response.status, errorText);
          lastError = new Error(`Anthropic API error: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log("Anthropic response received, finish_reason:", data?.stop_reason);

        const content = data?.content?.[0]?.text ?? "";
        console.log("Response content length:", content.length);

        if (!content.trim()) {
          console.error(`Empty response from Anthropic (attempt ${attempt + 1})`);
          lastError = new Error("Empty response from Anthropic");
          continue;
        }
        
        const match = content.match(/\{[\s\S]*\}/);
        if (!match) {
          console.error(`Failed to parse JSON (attempt ${attempt + 1}):`, content.slice(0, 200));
          lastError = new Error("Failed to parse AI response");
          continue;
        }
        
        const parsedContent = JSON.parse(match[0]);

        // Validate critical fields are non-empty
        const requiredFields = ["clarityCheck", "otherPersonPerspective", "accountabilitySteps"];
        const emptyFields = requiredFields.filter(f => !parsedContent[f]?.trim());
        
        if (emptyFields.length > 0) {
          console.error(`Empty required fields (attempt ${attempt + 1}):`, emptyFields.join(", "));
          lastError = new Error(`Empty fields: ${emptyFields.join(", ")}`);
          continue;
        }

        console.log("Valid response, returning to client");
        return new Response(
          JSON.stringify(parsedContent),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseErr) {
        console.error(`Parse/fetch error (attempt ${attempt + 1}):`, parseErr);
        lastError = parseErr as Error;
        continue;
      }
    }

    throw lastError || new Error("All retry attempts failed");

  } catch (error) {
    console.error("Error in analyze-crossed-line:", error);
    return new Response(
      JSON.stringify({ 
        error: "Service temporarily unavailable",
        clarityCheck: "We're having trouble processing this right now.",
        otherPersonPerspective: "Please try again in a moment.",
        yourPatterns: "",
        accountabilitySteps: "If this continues, please seek support from a trusted adult.",
        avoidingRepetition: ""
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
