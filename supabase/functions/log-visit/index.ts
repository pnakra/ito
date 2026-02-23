import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { path, referrer, user_agent, session_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("EXTERNAL_SUPABASE_URL")!,
      Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("visits").insert({
      metadata: {
        path: path || "/",
        referrer: referrer || "",
        userAgent: user_agent || "",
      },
    });

    if (error) {
      console.error("Visit insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("log-visit error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
