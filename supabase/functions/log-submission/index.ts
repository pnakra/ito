import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_BODY_BYTES = 32 * 1024; // 32 KB overall
const MAX_TEXT_LEN = 10000;        // freetext / ai response
const MAX_STEP_NAME_LEN = 200;
const MAX_CHOICE_LEN = 2000;
const MAX_METADATA_BYTES = 2048;   // 2 KB serialized
const MAX_METADATA_DEPTH = 2;

const ALLOWED_FLOW_TYPES = new Set(["before", "after-crossed", "after-someone-crossed"]);
const ALLOWED_STEP_TYPES = new Set(["choice", "freetext", "ai_response"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function objectDepth(value: unknown, depth = 0): number {
  if (value === null || typeof value !== "object") return depth;
  let max = depth;
  for (const v of Object.values(value as Record<string, unknown>)) {
    const d = objectDepth(v, depth + 1);
    if (d > max) max = d;
  }
  return max;
}

function truncateStr(value: unknown, max: number): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  return value.slice(0, max);
}

function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
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

    let body: Record<string, unknown>;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return badRequest("Invalid JSON");
    }

    // Required: session_id (UUID), flow_type, step_type, step_name
    const session_id = typeof body.session_id === "string" ? body.session_id : "";
    if (!UUID_RE.test(session_id)) return badRequest("Invalid session_id");

    const flow_type = typeof body.flow_type === "string" ? body.flow_type : "";
    if (!ALLOWED_FLOW_TYPES.has(flow_type)) return badRequest("Invalid flow_type");

    const step_type = typeof body.step_type === "string" ? body.step_type : "";
    if (!ALLOWED_STEP_TYPES.has(step_type)) return badRequest("Invalid step_type");

    const step_name = truncateStr(body.step_name, MAX_STEP_NAME_LEN);
    if (!step_name) return badRequest("Invalid step_name");

    const choice_value = truncateStr(body.choice_value, MAX_CHOICE_LEN);
    const freetext_value = truncateStr(body.freetext_value, MAX_TEXT_LEN);
    const ai_response_summary = truncateStr(body.ai_response_summary, MAX_TEXT_LEN);

    // Metadata: must be a plain object, shallow, small
    let metadata: Record<string, unknown> = {};
    if (body.metadata != null) {
      if (typeof body.metadata !== "object" || Array.isArray(body.metadata)) {
        return badRequest("Invalid metadata");
      }
      if (objectDepth(body.metadata) > MAX_METADATA_DEPTH) {
        return badRequest("Metadata too deeply nested");
      }
      const serialized = JSON.stringify(body.metadata);
      if (serialized.length > MAX_METADATA_BYTES) {
        return badRequest("Metadata too large");
      }
      metadata = body.metadata as Record<string, unknown>;
    }

    const message_index =
      typeof body.message_index === "number" && Number.isFinite(body.message_index)
        ? Math.max(0, Math.floor(body.message_index))
        : 0;

    const anon_id = truncateStr(body.anon_id, 128);

    const extUrl = Deno.env.get("EXTERNAL_SUPABASE_URL")!;
    const supabase = createClient(
      extUrl,
      Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("submissions").insert({
      id: crypto.randomUUID(),
      session_id,
      flow_type,
      step_name,
      step_type,
      choice_value,
      freetext_value,
      ai_response_summary,
      metadata,
      message_index,
      anon_id,
    });

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
