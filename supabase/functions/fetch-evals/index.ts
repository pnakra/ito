// fetch-evals — passcode-gated read access to eval_runs and eval_results
// for the /admin/evals page. The eval tables are service-role-only, so the
// browser cannot read them directly.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-eval-passcode, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PASSCODE = Deno.env.get("EVAL_ADMIN_PASSCODE")!;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const passcode = req.headers.get("x-eval-passcode") || "";
  if (!PASSCODE || !constantTimeEqual(passcode, PASSCODE)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  let body: { mode?: string; runId?: string; limit?: number } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine for default mode
  }

  const mode = body.mode ?? "history";

  if (mode === "history") {
    const limit = Math.min(Math.max(body.limit ?? 20, 1), 100);
    const { data, error } = await supabase
      .from("eval_runs")
      .select("id, started_at, finished_at, prompt_version_tag, total_count, pass_count, fail_count, avg_tone_score, notes")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ runs: data ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (mode === "run") {
    if (!body.runId) {
      return new Response(JSON.stringify({ error: "missing_runId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const [{ data: run }, { data: results }] = await Promise.all([
      supabase
        .from("eval_runs")
        .select("id, started_at, finished_at, prompt_version_tag, total_count, pass_count, fail_count, avg_tone_score, notes")
        .eq("id", body.runId)
        .maybeSingle(),
      supabase
        .from("eval_results")
        .select("*")
        .eq("run_id", body.runId)
        .order("scenario_id", { ascending: true }),
    ]);

    if (!run) {
      return new Response(JSON.stringify({ error: "run_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ run, results: results ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (mode === "cancel") {
    if (!body.runId) {
      return new Response(JSON.stringify({ error: "missing_runId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { error } = await supabase
      .from("eval_runs")
      .update({ cancel_requested: true })
      .eq("id", body.runId)
      .is("finished_at", null);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (mode === "delete") {
    if (!body.runId) {
      return new Response(JSON.stringify({ error: "missing_runId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Only allow deleting finished runs to avoid orphaning a live background loop.
    const { data: run } = await supabase
      .from("eval_runs")
      .select("id, finished_at")
      .eq("id", body.runId)
      .maybeSingle();
    if (!run) {
      return new Response(JSON.stringify({ error: "run_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!run.finished_at) {
      return new Response(JSON.stringify({ error: "run_not_finished" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await supabase.from("eval_results").delete().eq("run_id", body.runId);
    const { error } = await supabase.from("eval_runs").delete().eq("id", body.runId);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "unknown_mode" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
