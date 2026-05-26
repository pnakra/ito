// verify-eval-access — passcode gate for the hidden /admin/evals route.
// Compares a posted passcode against the EVAL_ADMIN_PASSCODE secret using
// constant-time comparison. Never logs the actual passcode.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { passcode } = await req.json().catch(() => ({ passcode: "" }));
    const expected = Deno.env.get("EVAL_ADMIN_PASSCODE");

    if (!expected) {
      console.error("[verify-eval-access] EVAL_ADMIN_PASSCODE not configured");
      return new Response(JSON.stringify({ ok: false, error: "server_not_configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof passcode !== "string" || passcode.length === 0 || passcode.length > 200) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ok = constantTimeEqual(passcode, expected);
    // Tiny delay to soften brute force; serverless cold starts dominate anyway.
    await new Promise((r) => setTimeout(r, 250));

    return new Response(JSON.stringify({ ok }), {
      status: ok ? 200 : 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[verify-eval-access] error", err);
    return new Response(JSON.stringify({ ok: false, error: "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
