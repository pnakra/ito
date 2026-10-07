// Proxy only. The real function lives on the external Supabase project and is deployed there. Do not add prompt text here.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const FN = "practice-roleplay";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const base = Deno.env.get("EXTERNAL_SUPABASE_URL");
  if (!base) {
    return new Response(JSON.stringify({ error: "Service configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const xff = req.headers.get("x-forwarded-for");
  if (xff) headers["x-forwarded-for"] = xff;

  try {
    const upstream = await fetch(`${base}/functions/v1/${FN}`, { method: "POST", headers, body });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (e) {
    console.error("proxy error", e);
    return new Response(JSON.stringify({ error: "Upstream unreachable" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
