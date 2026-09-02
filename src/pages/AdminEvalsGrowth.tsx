import { useCallback, useEffect, useMemo, useState } from "react";
import { adminSupabase } from "@/lib/adminSupabase";
import AdminAuthGate from "@/components/evals/AdminAuthGate";
import EvalsTabs from "@/components/evals/EvalsTabs";
import SEO from "@/components/SEO";

type SessionRow = {
  session_id: string;
  started_at: string;
  last_activity_at: string | null;
  anon_id: string | null;
  total_steps: number | null;
  followup_steps: number | null;
  has_followup: boolean | null;
  narrative_text: string | null;
  source_type: string | null;
  referrer: string | null;
  is_prolific: boolean | null;
  prolific_pid: string | null;
  age_user: string | number | null;
  age_prefer_not_to_say: boolean | null;
  confidence_pre: number | null;
  confidence_post: number | null;
  outcome: string | null;
  flagged_junk: boolean | null;
};

const REAL_SOURCES = new Set(["typed", "chip_edited"]);

const AGE_BUCKETS = [
  "under-16",
  "16-17",
  "18-24",
  "25-plus",
  "prefer-not-to-say",
  "unknown",
] as const;
type AgeBucket = (typeof AGE_BUCKETS)[number];

const OUTCOMES = [
  "checked-in",
  "not-sure",
  "didnt-proceed",
  "stopped",
  "prefer-not-to-say",
] as const;

function ageBucket(row: SessionRow): AgeBucket {
  if (row.age_prefer_not_to_say) return "prefer-not-to-say";
  const raw = row.age_user;
  if (raw == null || raw === "") return "unknown";
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase();
    if (s === "prefer-not-to-say" || s === "prefer not to say") return "prefer-not-to-say";
    if ((AGE_BUCKETS as readonly string[]).includes(s)) return s as AgeBucket;
    const n = Number(s);
    if (!Number.isFinite(n)) return "unknown";
    return numericBucket(n);
  }
  return numericBucket(raw);
}

function numericBucket(n: number): AgeBucket {
  if (n < 16) return "under-16";
  if (n < 18) return "16-17";
  if (n < 25) return "18-24";
  return "25-plus";
}

function pct(n: number, d: number): string {
  if (d === 0) return "–";
  return `${Math.round((n / d) * 100)}%`;
}

function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(m: string): string {
  const d = new Date(`${m}-01T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-border rounded px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-mono text-foreground">{value}</div>
      {sub && <div className="text-[10px] font-mono text-muted-foreground">{sub}</div>}
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const share = total > 0 ? count / total : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3 text-xs font-mono">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">
          {count} · {pct(count, total)}
        </span>
      </div>
      <div className="h-2 w-full bg-foreground/5 rounded-sm overflow-hidden">
        <div
          className="h-full bg-foreground/25 rounded-sm"
          style={{ width: `${Math.max(share > 0 ? 2 : 0, share * 100)}%` }}
        />
      </div>
    </div>
  );
}

function Empty({ note = "not enough data yet" }: { note?: string }) {
  return <p className="text-xs font-mono text-muted-foreground">{note}</p>;
}

function GrowthDashboard({ email }: { email: string }) {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let problem: string | null = null;
      try {
        const { error } = await adminSupabase
          .from("session_summary")
          .select("session_id", { count: "exact", head: true });
        if (error) problem = `session_summary unreachable (${error.message})`;
      } catch (e) {
        problem = `cannot reach the eval database (${e instanceof Error ? e.message : "network error"})`;
      }
      if (!cancelled) setHealth(problem);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: sessionData } = await adminSupabase.auth.getSession();
    if (!sessionData.session) {
      setError("No active session — sign in again.");
      setLoading(false);
      return;
    }
    const { data, error } = await adminSupabase
      .from("session_summary")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(5000);
    if (error) setError(`session_summary: ${error.message}`);
    else setRows((data ?? []) as unknown as SessionRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const clean = rows.filter((r) => !r.flagged_junk);
    const isReal = (r: SessionRow) => REAL_SOURCES.has((r.source_type ?? "").toLowerCase());
    const real = clean.filter(isReal);
    const organic = real.filter((r) => !r.is_prolific);
    const prolific = clean.filter((r) => r.is_prolific);

    const uniqueAnon = new Set(clean.map((r) => r.anon_id).filter(Boolean) as string[]);

    // 2 — age, organic real sessions only
    const ageCounts = new Map<AgeBucket, number>(AGE_BUCKETS.map((b) => [b, 0]));
    for (const r of organic) {
      const b = ageBucket(r);
      ageCounts.set(b, (ageCounts.get(b) ?? 0) + 1);
    }

    // monthly % of known-age sessions self-reporting under 18
    const monthMap = new Map<string, { known: number; minor: number }>();
    for (const r of organic) {
      const b = ageBucket(r);
      if (b === "unknown" || b === "prefer-not-to-say") continue;
      const m = monthOf(r.started_at);
      const cur = monthMap.get(m) ?? { known: 0, minor: 0 };
      cur.known += 1;
      if (b === "under-16" || b === "16-17") cur.minor += 1;
      monthMap.set(m, cur);
    }
    const ageTrend = [...monthMap.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([m, v]) => ({ month: m, known: v.known, minor: v.minor, rate: v.minor / v.known }));

    // 3 — engagement
    const perAnon = new Map<string, number>();
    for (const r of organic) {
      if (!r.anon_id) continue;
      perAnon.set(r.anon_id, (perAnon.get(r.anon_id) ?? 0) + 1);
    }
    const anonCounts = [...perAnon.values()];
    const dist = {
      one: anonCounts.filter((c) => c === 1).length,
      two: anonCounts.filter((c) => c === 2).length,
      threePlus: anonCounts.filter((c) => c >= 3).length,
    };
    const repeatAnon = dist.two + dist.threePlus;
    const followupOrganic = organic.filter((r) => r.has_followup).length;

    // 4 — outcomes
    const outcomeCounts = new Map<string, number>(OUTCOMES.map((o) => [o, 0]));
    let outcomeOther = 0;
    let outcomeAny = 0;
    for (const r of organic) {
      const o = (r.outcome ?? "").trim().toLowerCase();
      if (!o) continue;
      outcomeAny += 1;
      if (outcomeCounts.has(o)) outcomeCounts.set(o, (outcomeCounts.get(o) ?? 0) + 1);
      else outcomeOther += 1;
    }
    const bothConf = organic.filter(
      (r) => typeof r.confidence_pre === "number" && typeof r.confidence_post === "number",
    );
    const avg = (xs: number[]) =>
      xs.length > 0 ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
    const confPre = avg(bothConf.map((r) => r.confidence_pre as number));
    const confPost = avg(bothConf.map((r) => r.confidence_post as number));

    // 5 — referrers
    const refMap = new Map<string, { total: number; real: number }>();
    for (const r of clean) {
      const key = (r.referrer ?? "").trim() || "(direct / none)";
      const cur = refMap.get(key) ?? { total: 0, real: 0 };
      cur.total += 1;
      if (isReal(r)) cur.real += 1;
      refMap.set(key, cur);
    }
    const referrers = [...refMap.entries()]
      .map(([referrer, v]) => ({ referrer, ...v }))
      .sort((a, b) => b.total - a.total);

    const junk = rows.filter((r) => r.flagged_junk).length;

    return {
      rawTotal: rows.length,
      cleanTotal: clean.length,
      real,
      organic,
      prolificCount: prolific.length,
      uniqueAnon: uniqueAnon.size,
      realFollowup: real.filter((r) => r.has_followup).length,
      realOutcome: real.filter((r) => (r.outcome ?? "").trim() !== "").length,
      ageCounts,
      ageTrend,
      anonTotal: perAnon.size,
      dist,
      repeatAnon,
      followupOrganic,
      outcomeCounts,
      outcomeOther,
      outcomeAny,
      bothConfCount: bothConf.length,
      confPre,
      confPost,
      referrers,
      junk,
    };
  }, [rows]);

  const organicTotal = stats.organic.length;

  return (
    <main className="min-h-[100dvh] bg-background text-foreground px-6 py-10 pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
          <h1 className="font-serif text-3xl">growth</h1>
          <div className="flex items-center gap-4">
            <EvalsTabs />
            <button
              onClick={() => adminSupabase.auth.signOut()}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              sign out
            </button>
          </div>
        </header>

        <div className="text-xs font-mono text-muted-foreground">
          signed in as {email} · {loading ? "loading…" : `${rows.length} sessions`}
        </div>

        {health && (
          <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/40 rounded px-3 py-2">
            Connection warning — {health}
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive font-mono border border-destructive/40 rounded px-3 py-2">
            query error — {error}
          </p>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="text-sm text-muted-foreground border border-border rounded px-3 py-2">
            The query succeeded but session_summary returned zero rows — not enough data yet.
          </p>
        )}

        {/* 1 — header KPIs */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Stat label="sessions" value={String(stats.total)} />
          <Stat label="real narrative" value={String(stats.real.length)} sub="typed / chip_edited" />
          <Stat label="prolific" value={String(stats.prolificCount)} />
          <Stat label="unique anon ids" value={String(stats.uniqueAnon)} />
          <Stat
            label="real w/ follow-up"
            value={pct(stats.realFollowup, stats.real.length)}
            sub={`${stats.realFollowup}/${stats.real.length}`}
          />
          <Stat
            label="real w/ outcome"
            value={pct(stats.realOutcome, stats.real.length)}
            sub={`${stats.realOutcome}/${stats.real.length}`}
          />
        </section>

        {/* 2 — audience / age */}
        <section className="border border-border rounded p-4 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              audience / age
            </h2>
            <span className="text-[10px] font-mono text-muted-foreground">
              non-prolific real sessions · n={organicTotal}
            </span>
          </div>

          {organicTotal === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2.5">
              {AGE_BUCKETS.map((b) => (
                <BarRow
                  key={b}
                  label={b}
                  count={stats.ageCounts.get(b) ?? 0}
                  total={organicTotal}
                />
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              monthly · % of known-age sessions self-reporting under 18
            </div>
            {stats.ageTrend.length === 0 ? (
              <Empty note="not enough data yet — no sessions with a known age" />
            ) : stats.ageTrend.length === 1 ? (
              <p className="text-xs font-mono text-muted-foreground">
                {monthLabel(stats.ageTrend[0].month)} ·{" "}
                {pct(stats.ageTrend[0].minor, stats.ageTrend[0].known)} under 18 (
                {stats.ageTrend[0].minor}/{stats.ageTrend[0].known}) — one month of data so far,
                trend appears next month.
              </p>
            ) : (
              <div className="flex items-end gap-2 h-20">
                {stats.ageTrend.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-foreground/25 rounded-sm"
                      style={{ height: `${Math.max(4, m.rate * 64)}px` }}
                      title={`${monthLabel(m.month)} · ${m.minor}/${m.known} under 18`}
                    />
                    <div className="text-[9px] font-mono text-muted-foreground truncate">
                      {Math.round(m.rate * 100)}%
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground truncate">
                      {monthLabel(m.month)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3 — engagement */}
        <section className="border border-border rounded p-4 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">engagement</h2>
            <span className="text-[10px] font-mono text-muted-foreground">
              non-prolific real sessions
            </span>
          </div>
          {stats.anonTotal === 0 ? (
            <Empty />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Stat
                  label="returning anon ids"
                  value={pct(stats.repeatAnon, stats.anonTotal)}
                  sub={`${stats.repeatAnon}/${stats.anonTotal} with >1 session`}
                />
                <Stat label="unique anon ids" value={String(stats.anonTotal)} />
                <Stat
                  label="follow-up rate"
                  value={pct(stats.followupOrganic, organicTotal)}
                  sub={`${stats.followupOrganic}/${organicTotal}`}
                />
              </div>
              <div className="space-y-2.5">
                <BarRow label="1 session" count={stats.dist.one} total={stats.anonTotal} />
                <BarRow label="2 sessions" count={stats.dist.two} total={stats.anonTotal} />
                <BarRow label="3+ sessions" count={stats.dist.threePlus} total={stats.anonTotal} />
              </div>
            </>
          )}
        </section>

        {/* 4 — outcome */}
        <section className="border border-border rounded p-4 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">outcome</h2>
            <span className="text-[10px] font-mono text-muted-foreground">
              non-prolific real sessions · n={organicTotal}
            </span>
          </div>
          {organicTotal === 0 ? (
            <Empty />
          ) : (
            <>
              <div className="space-y-2.5">
                {OUTCOMES.map((o) => (
                  <BarRow
                    key={o}
                    label={o}
                    count={stats.outcomeCounts.get(o) ?? 0}
                    total={organicTotal}
                  />
                ))}
                {stats.outcomeOther > 0 && (
                  <BarRow label="other" count={stats.outcomeOther} total={organicTotal} />
                )}
                <BarRow
                  label="no answer"
                  count={organicTotal - stats.outcomeAny}
                  total={organicTotal}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border">
                <Stat
                  label="response rate"
                  value={pct(stats.outcomeAny, organicTotal)}
                  sub={`${stats.outcomeAny}/${organicTotal}`}
                />
                <Stat
                  label="confidence pre"
                  value={stats.confPre != null ? stats.confPre.toFixed(2) : "–"}
                  sub={`n=${stats.bothConfCount}`}
                />
                <Stat
                  label="confidence post"
                  value={stats.confPost != null ? stats.confPost.toFixed(2) : "–"}
                  sub={`n=${stats.bothConfCount}`}
                />
                <Stat
                  label="delta"
                  value={
                    stats.confPre != null && stats.confPost != null
                      ? `${stats.confPost - stats.confPre >= 0 ? "+" : ""}${(
                          stats.confPost - stats.confPre
                        ).toFixed(2)}`
                      : "–"
                  }
                  sub={stats.bothConfCount === 0 ? "not enough data yet" : "post − pre"}
                />
              </div>
            </>
          )}
        </section>

        {/* 5 — referrers */}
        <section className="border border-border rounded p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">referrers</h2>
          {stats.referrers.length === 0 ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="font-normal py-1 pr-3">referrer</th>
                    <th className="font-normal py-1 pr-3 text-right">sessions</th>
                    <th className="font-normal py-1 text-right">% real narrative</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.referrers.map((r) => (
                    <tr key={r.referrer} className="border-t border-border">
                      <td className="py-1.5 pr-3 text-foreground break-all">{r.referrer}</td>
                      <td className="py-1.5 pr-3 text-right text-muted-foreground">{r.total}</td>
                      <td className="py-1.5 text-right text-foreground">
                        {pct(r.real, r.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 6 — data hygiene */}
        <section className="border border-border rounded px-4 py-3">
          <p className="text-xs font-mono text-muted-foreground">
            data hygiene · {stats.junk} of {stats.total} sessions flagged junk (
            {pct(stats.junk, stats.total)}) — excluded from analytics elsewhere, shown here for
            visibility only.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function AdminEvalsGrowth() {
  return (
    <>
      <SEO
        title="Growth"
        description="Internal growth and audience analytics."
        path="/admin/evals/growth"
      />
      <AdminAuthGate>
        {(session) => <GrowthDashboard email={session.user.email ?? "unknown"} />}
      </AdminAuthGate>
    </>
  );
}
