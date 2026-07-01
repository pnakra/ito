import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_BODY_BYTES = 4 * 1024; // 4 KB
const MAX_FIELD_LEN = 2000;

function truncate(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function safeReferrer(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "";
  const trimmed = value.slice(0, MAX_FIELD_LEN);
  try {
    // Allow only http(s) URLs
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.toString().slice(0, MAX_FIELD_LEN);
  } catch {
    return "";
  }
}

function safePath(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "/";
  const trimmed = value.slice(0, MAX_FIELD_LEN);
  // Must start with / and contain only URL path-safe chars
  if (!/^\/[A-Za-z0-9\-._~!$&'()*+,;=:@/%?#]*$/.test(trimmed)) return "/";
  return trimmed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enforce maximum body size
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength && contentLength > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown> = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const path = safePath(body.path) ?? "/";
    const referrer = safeReferrer(body.referrer);
    const user_agent = truncate(body.user_agent, MAX_FIELD_LEN);
    const session_id = typeof body.session_id === "string" ? body.session_id : null;

    // Parse UTM params from referrer or path query string
    let utm: Record<string, string | null> = {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
    let variant: string | null = null;
    try {
      const qIndex = (typeof body.path === "string" ? body.path : "").indexOf("?");
      if (qIndex >= 0) {
        const params = new URLSearchParams((body.path as string).slice(qIndex + 1));
        for (const k of Object.keys(utm)) utm[k] = params.get(k);
        variant = params.get("variant");
      }
    } catch {
      // ignore
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("visits").insert({
      path,
      referrer,
      user_agent,
      session_id,
      variant,
      ...utm,
      metadata: {},
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
