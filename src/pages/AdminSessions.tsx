import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminSupabase } from "@/lib/adminSupabase";
import AdminAuthGate from "@/components/evals/AdminAuthGate";
import SEO from "@/components/SEO";

type SubmissionRow = {
  id: string;
  session_id: string;
  anon_id: string | null;
  flow_type: string | null;
  step_name: string | null;
  step_type: string | null;
  choice_value: string | null;
  freetext_value: string | null;
  ai_response_summary: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const PAGE_SIZE = 20;
const TZ = "America/Chicago";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Strip the "Risk: yellow | " style prefix from stored AI summaries. */
function cleanResponse(text: string | null): string {
  if (!text) return "";
  return text.replace(/^\s*risk:\s*[a-z\s-]+\|\s*/i, "").trim();
}

function anonOf(r: SubmissionRow): string | null {
  if (r.anon_id) return r.anon_id;
  const m = r.metadata as Record<string, unknown> | null;
  const v = m?.anon_id ?? m?.anonId;
  return typeof v === "string" ? v : null;
}

function useSubmissions() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await adminSupabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) setError(`submissions: ${error.message}`);
    else setRows((data ?? []) as unknown as SubmissionRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, loading, error, reload: load };
}

function Shell({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8 pb-12">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-2xl text-foreground">{title}</h1>
          <div className="flex items-center gap-3">
            {right}
            <button
              onClick={() => adminSupabase.auth.signOut()}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              sign out
            </button>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

function SessionList() {
  const { rows, loading, error } = useSubmissions();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const sessions = useMemo(() => {
    const map = new Map<
      string,
      {
        session_id: string;
        anon_id: string | null;
        created_at: string;
        count: number;
        preview: string;
      }
    >();
    // rows are newest-first; iterate ascending so preview = first freetext
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i];
      const prev = map.get(r.session_id);
      if (!prev) {
        map.set(r.session_id, {
          session_id: r.session_id,
          anon_id: anonOf(r),
          created_at: r.created_at ?? "",
          count: 1,
          preview: r.freetext_value?.trim() ?? "",
        });
      } else {
        prev.count += 1;
        prev.anon_id = prev.anon_id ?? anonOf(r);
        if (!prev.preview && r.freetext_value) prev.preview = r.freetext_value.trim();
      }
    }
    const list = [...map.values()].sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    );
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (s) =>
        s.session_id.toLowerCase().includes(term) ||
        (s.anon_id ?? "").toLowerCase().includes(term),
    );
  }, [rows, q]);

  const pageCount = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const slice = sessions.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <Shell
      title="sessions"
      right={
        <span className="text-[11px] font-mono text-muted-foreground">
          {sessions.length} sessions
        </span>
      }
    >
      <SEO title="Sessions" description="Admin session viewer" path="/sessions" />

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(0);
        }}
        placeholder="search by session_id or anon_id"
        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground font-mono"
      />

      {loading && <p className="text-sm text-muted-foreground">loading...</p>}
      {error && <p className="text-sm text-destructive font-mono">{error}</p>}

      {!loading && !error && sessions.length === 0 && (
        <p className="text-sm text-muted-foreground">No sessions found.</p>
      )}

      <div className="space-y-2">
        {slice.map((s) => (
          <Link
            key={s.session_id}
            to={`/sessions/${s.session_id}`}
            className="block border border-border rounded px-4 py-3 hover:bg-foreground/5 transition-colors"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-[11px] font-mono text-muted-foreground">
              <span className="text-foreground">{s.session_id}</span>
              <span>{fmt(s.created_at)}</span>
            </div>
            <div className="mt-1 text-[11px] font-mono text-muted-foreground">
              anon: {s.anon_id ?? "—"} · {s.count} rows
            </div>
            {s.preview && (
              <p className="mt-2 text-sm text-foreground/80 line-clamp-2">
                {s.preview.slice(0, 220)}
                {s.preview.length > 220 ? "…" : ""}
              </p>
            )}
          </Link>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-xs font-mono">
          <button
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="border border-border rounded px-3 py-1.5 disabled:opacity-40"
          >
            prev
          </button>
          <span className="text-muted-foreground">
            page {current + 1} / {pageCount}
          </span>
          <button
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
            className="border border-border rounded px-3 py-1.5 disabled:opacity-40"
          >
            next
          </button>
        </div>
      )}
    </Shell>
  );
}

/** Ordered list of session ids, matching the list view's ordering (newest first). */
function useSessionOrder() {
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await adminSupabase
        .from("submissions")
        .select("session_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (cancelled || error || !data) return;
      const starts = new Map<string, string>();
      for (let i = data.length - 1; i >= 0; i--) {
        const r = data[i] as { session_id: string; created_at: string | null };
        if (!starts.has(r.session_id)) starts.set(r.session_id, r.created_at ?? "");
      }
      setOrder(
        [...starts.entries()]
          .sort((a, b) => b[1].localeCompare(a[1]))
          .map(([id]) => id),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return order;
}

function SessionDetail({ sessionId }: { sessionId: string }) {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const order = useSessionOrder();
  const navigate = useNavigate();

  const idx = order.indexOf(sessionId);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight" && nextId) navigate(`/sessions/${nextId}`);
      if (e.key === "ArrowLeft" && prevId) navigate(`/sessions/${prevId}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextId, prevId, navigate]);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      window.scrollTo({ top: 0 });
      const { data, error } = await adminSupabase
        .from("submissions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) setError(`submissions: ${error.message}`);
      else setRows((data ?? []) as unknown as SubmissionRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const meta = useMemo(() => {
    const anon = rows.map(anonOf).find(Boolean) ?? null;
    const flows = [...new Set(rows.map((r) => r.flow_type).filter(Boolean))] as string[];
    return {
      anon,
      flows,
      first: rows[0]?.created_at ?? null,
      last: rows[rows.length - 1]?.created_at ?? null,
      count: rows.length,
    };
  }, [rows]);

  return (
    <Shell
      title="session"
      right={
        <div className="flex items-center gap-3">
          {idx >= 0 && (
            <span className="text-[11px] font-mono text-muted-foreground">
              {idx + 1} / {order.length}
            </span>
          )}
          <button
            disabled={!prevId}
            onClick={() => prevId && navigate(`/sessions/${prevId}`)}
            className="border border-border rounded px-3 py-1.5 text-xs font-mono disabled:opacity-40"
            title="previous conversation (←)"
          >
            ← prev
          </button>
          <button
            disabled={!nextId}
            onClick={() => nextId && navigate(`/sessions/${nextId}`)}
            className="border border-border rounded px-3 py-1.5 text-xs font-mono disabled:opacity-40"
            title="next conversation (→)"
          >
            next →
          </button>
          <Link
            to="/sessions"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            back to sessions
          </Link>
        </div>
      }
    >
      <SEO title="Session detail" description="Admin session viewer" path="/sessions" />

      {loading && <p className="text-sm text-muted-foreground">loading...</p>}
      {error && <p className="text-sm text-destructive font-mono">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No rows for this session.</p>
      )}

      {rows.length > 0 && (
        <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
          <div className="space-y-4">
            {rows.map((r) => {
              const userText = r.freetext_value?.trim() || r.choice_value?.trim() || "";
              const ai = cleanResponse(r.ai_response_summary);
              return (
                <div key={r.id} className="border border-border rounded px-4 py-3 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span>{r.step_name ?? "—"}</span>
                    <span>{fmtTime(r.created_at)}</span>
                  </div>
                  {userText && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        user
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{userText}</p>
                    </div>
                  )}
                  {ai && (
                    <div className="border-l-2 border-foreground/20 pl-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        ito
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{ai}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <aside className="space-y-3 text-[11px] font-mono">
            <div className="border border-border rounded px-3 py-2 space-y-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  session_id
                </div>
                <div className="text-foreground break-all">{sessionId}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  anon_id
                </div>
                <div className="text-foreground break-all">{meta.anon ?? "—"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  flow
                </div>
                <div className="text-foreground">{meta.flows.join(", ") || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  range (chicago)
                </div>
                <div className="text-foreground">{fmt(meta.first)}</div>
                <div className="text-muted-foreground">→ {fmt(meta.last)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  messages
                </div>
                <div className="text-foreground">{meta.count}</div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </Shell>
  );
}

export default function AdminSessions() {
  const { sessionId } = useParams<{ sessionId: string }>();
  return (
    <AdminAuthGate>
      {() => (sessionId ? <SessionDetail sessionId={sessionId} /> : <SessionList />)}
    </AdminAuthGate>
  );
}
