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
    const body = await req.json();
    const extUrl = Deno.env.get("EXTERNAL_SUPABASE_URL")!;
    console.log("Connecting to external DB:", extUrl?.substring(0, 40));
    const supabase = createClient(
      extUrl,
      Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY")!
    );
    const generatedId = crypto.randomUUID();
    console.log("Inserting submission with id:", generatedId);
    const { data, error, status, statusText } = await supabase.from("submissions").insert({
      id: generatedId,
      session_id: body.session_id,
      flow_type: body.flow_type,
      step_name: body.step_name,
      step_type: body.step_type,
      choice_value: body.choice_value || null,
      freetext_value: body.freetext_value || null,
      ai_response_summary: body.ai_response_summary || null,
      metadata: body.metadata ?? {},
      message_index: body.message_index ?? 0,
      anon_id: body.anon_id || null,
    }).select();
    console.log("Insert response - status:", status, statusText, "data:", JSON.stringify(data), "error:", JSON.stringify(error));
    if (error) {
      console.error("Submission insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("log-submission error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
