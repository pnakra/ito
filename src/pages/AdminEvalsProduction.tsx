import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/evals/AdminAuthGate";
import EvalsTabs from "@/components/evals/EvalsTabs";
import SEO from "@/components/SEO";

type Grade = {
  id: string;
  session_id: string;
  session_started_at: string;
  flow_type: string;
  overall: number | null;
  scores: Record<string, unknown>;
  gates: Record<string, unknown>;
  flags: unknown;
  summary: string | null;
  transcript: string | null;
  evidence: Record<string, unknown>;
  week_of: string | null;
};

type ActionItem = {
  id: string;
  grade_session_id: string;
  fix: string;
  target_function: string | null;
  target_location: string | null;
  plan: Record<string, unknown>;
  status: string;
  notes: string | null;
  week_of: string | null;
  created_at: string;
};

const STATUSES = ["proposed", "approved", "backlog", "ignored", "applied"] as const;

function mondayOf(iso: string): string {
  const d = new Date(iso);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function weekLabel(monday: string): string {
  const start = new Date(`${monday}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function scoreTone(v: number | null | undefined) {
  if (v == null) return "text-muted-foreground";
  if (v >= 4) return "text-foreground";
  if (v >= 3) return "text-amber-400";
  return "text-destructive";
}

function GateChip({ name, pass }: { name: string; pass: boolean | null }) {
  const cls =
    pass === null
      ? "border-border text-muted-foreground"
      : pass
        ? "border-foreground/30 text-foreground"
        : "border-destructive/60 text-destructive";
  return (
    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${cls}`}>
      {name}
      {pass === null ? " –" : pass ? " ✓" : " ✕"}
    </span>
  );
}

function SessionCard({ grade, actions }: { grade: Grade; actions: ActionItem[] }) {
  const scoreEntries = Object.entries(grade.scores ?? {}).filter(
    ([, v]) => typeof v === "number",
  ) as Array<[string, number]>;
  const gateEntries = Object.entries(grade.gates ?? {});
  const evidenceEntries = Object.entries(grade.evidence ?? {});

  return (
    <details className="border border-border rounded p-4 bg-foreground/[0.02]">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm text-foreground truncate">
              {grade.summary ?? "(no summary)"}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              {new Date(grade.session_started_at).toLocaleString()} · {grade.flow_type} ·{" "}
              {grade.session_id.slice(0, 8)}
            </div>
          </div>
          <div className={`text-lg font-mono ${scoreTone(grade.overall)}`}>
            {grade.overall != null ? grade.overall.toFixed(1) : "–"}
          </div>
        </div>
        {gateEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {gateEntries.map(([k, v]) => (
              <GateChip key={k} name={k} pass={typeof v === "boolean" ? v : null} />
            ))}
          </div>
        )}
      </summary>

      <div className="mt-4 space-y-4 text-sm">
        {scoreEntries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {scoreEntries.map(([k, v]) => (
              <div key={k} className="border border-border rounded px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {k.replace(/_/g, " ")}
                </div>
                <div className={`font-mono ${scoreTone(v)}`}>{v}/5</div>
              </div>
            ))}
          </div>
        )}

        {evidenceEntries.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              evidence
            </div>
            {evidenceEntries.map(([k, v]) => (
              <div key={k} className="text-xs">
                <span className="text-muted-foreground">{k.replace(/_/g, " ")}: </span>
                <span className="italic">
                  {typeof v === "string" ? `"${v}"` : JSON.stringify(v)}
                </span>
              </div>
            ))}
          </div>
        )}

        {grade.transcript && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">transcript</summary>
            <pre className="mt-2 p-3 bg-foreground/5 rounded overflow-x-auto whitespace-pre-wrap font-sans leading-relaxed">
              {grade.transcript}
            </pre>
          </details>
        )}

        {actions.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {actions.length} action item{actions.length === 1 ? "" : "s"} in the queue
          </div>
        )}
      </div>
    </details>
  );
}

function ActionRow({
  item,
  onUpdate,
}: {
  item: ActionItem;
  onUpdate: (id: string, patch: Partial<ActionItem>) => void;
}) {
  const [notes, setNotes] = useState(item.notes ?? "");
  const steps = Array.isArray((item.plan as { steps?: unknown })?.steps)
    ? ((item.plan as { steps: unknown[] }).steps as unknown[])
    : [];

  return (
    <div className="border border-border rounded p-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm text-foreground">{item.fix}</div>
          <div className="text-[11px] font-mono text-muted-foreground mt-1">
            {item.target_function ?? "—"}
            {item.target_location ? ` · ${item.target_location}` : ""} ·{" "}
            {item.grade_session_id.slice(0, 8)}
          </div>
        </div>
        <select
          value={item.status}
          onChange={(e) => onUpdate(item.id, { status: e.target.value })}
          className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {steps.length > 0 && (
        <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
          {steps.map((s, i) => (
            <li key={i}>{typeof s === "string" ? s : JSON.stringify(s)}</li>
          ))}
        </ol>
      )}

      <div className="flex gap-2">
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="notes"
          className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
        />
        {notes !== (item.notes ?? "") && (
          <button
            onClick={() => onUpdate(item.id, { notes })}
            className="text-xs px-2 py-1 rounded bg-foreground text-background"
          >
            save
          </button>
        )}
      </div>
    </div>
  );
}

function ProductionDashboard({ email }: { email: string }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("proposed");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Only runs behind AdminAuthGate, so this client already carries a session
    // and the requests go out authenticated.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("No active session — sign in again.");
      setLoading(false);
      return;
    }
    const [g, a] = await Promise.all([
      supabase
        .from("eval_grades")
        .select("*")
        .order("session_started_at", { ascending: false })
        .limit(500),
      supabase.from("action_queue").select("*").order("created_at", { ascending: false }),
    ]);
    const errs: string[] = [];
    if (g.error) errs.push(`eval_grades: ${g.error.message}`);
    else setGrades((g.data ?? []) as unknown as Grade[]);
    if (a.error) errs.push(`action_queue: ${a.error.message}`);
    else setActions((a.data ?? []) as unknown as ActionItem[]);
    setError(errs.length > 0 ? errs.join(" · ") : null);
    setLoading(false);
  }, []);


  useEffect(() => {
    load();
  }, [load]);

  async function updateAction(id: string, patch: Partial<ActionItem>) {
    setActions((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    const { error } = await supabase
      .from("action_queue")
      .update({ ...(patch as Record<string, never>), decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setError(error.message);
      load();
    }
  }

  const weeks = useMemo(() => {
    const map = new Map<string, Grade[]>();
    for (const g of grades) {
      const key = g.week_of ?? mondayOf(g.session_started_at);
      const arr = map.get(key) ?? [];
      arr.push(g);
      map.set(key, arr);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [grades]);

  const actionsBySession = useMemo(() => {
    const map = new Map<string, ActionItem[]>();
    for (const a of actions) {
      const arr = map.get(a.grade_session_id) ?? [];
      arr.push(a);
      map.set(a.grade_session_id, arr);
    }
    return map;
  }, [actions]);

  const visibleActions = actions.filter(
    (a) => statusFilter === "all" || a.status === statusFilter,
  );

  return (
    <main className="min-h-[100dvh] bg-background text-foreground px-6 py-10 pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
          <h1 className="font-serif text-3xl">production evals</h1>
          <div className="flex items-center gap-4">
            <EvalsTabs />
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              sign out
            </button>
          </div>
        </header>

        <div className="text-xs font-mono text-muted-foreground">
          signed in as {email} · {loading ? "loading…" : `${grades.length} graded sessions, ${actions.length} action items`}
        </div>

        {error && (
          <p className="text-sm text-destructive font-mono border border-destructive/40 rounded px-3 py-2">
            query error — {error}
          </p>
        )}

        {!loading && !error && grades.length === 0 && actions.length === 0 && (
          <p className="text-sm text-muted-foreground border border-border rounded px-3 py-2">
            Signed in and the queries succeeded, but both tables returned zero rows — nothing has
            been graded yet.
          </p>
        )}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              action queue
            </h2>
            <div className="flex gap-1.5">
              {["all", ...STATUSES].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-[11px] px-2 py-1 rounded border ${
                    statusFilter === s
                      ? "border-foreground/40 text-foreground bg-foreground/5"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {visibleActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing {statusFilter === "all" ? "in the queue" : `marked ${statusFilter}`} yet.
            </p>
          ) : (
            <div className="space-y-2">
              {visibleActions.map((item) => (
                <ActionRow key={item.id} item={item} onUpdate={updateAction} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
            graded sessions
          </h2>
          {loading && <p className="text-sm text-muted-foreground">loading...</p>}
          {!loading && weeks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No graded sessions yet. Once real sessions come in and get graded, they'll be
              grouped by week here.
            </p>
          )}
          {weeks.map(([monday, rows]) => {
            const scored = rows.filter((r) => r.overall != null) as Array<Grade & { overall: number }>;
            const avg =
              scored.length > 0
                ? (scored.reduce((a, b) => a + b.overall, 0) / scored.length).toFixed(2)
                : "–";
            return (
              <div key={monday} className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
                  <h3 className="font-serif text-xl">week of {weekLabel(monday)}</h3>
                  <div className="text-xs font-mono text-muted-foreground">
                    {rows.length} session{rows.length === 1 ? "" : "s"} · avg {avg}
                  </div>
                </div>
                <div className="space-y-2">
                  {rows.map((g) => (
                    <SessionCard
                      key={g.id}
                      grade={g}
                      actions={actionsBySession.get(g.session_id) ?? []}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default function AdminEvalsProduction() {
  return (
    <>
      <SEO title="Production evals" description="Internal production eval review." path="/admin/evals/production" />
      <AdminAuthGate>
        {(session) => <ProductionDashboard email={session.user.email ?? "unknown"} />}
      </AdminAuthGate>
    </>
  );
}
