import { useEffect, useState } from "react";

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const SESSION_KEY = "ito_eval_auth_v1";

interface RunSummary {
  id: string;
  started_at: string;
  finished_at: string | null;
  prompt_version_tag: string | null;
  total_count: number;
  pass_count: number;
  fail_count: number;
  avg_tone_score: number | null;
}

interface ResultRow {
  id: string;
  scenario_id: string;
  tier: string;
  input_text: string;
  expected_risk_level: string;
  actual_risk_level: string | null;
  classification_pass: boolean;
  expected_refusal: boolean;
  refusal_fired: boolean;
  refusal_pass: boolean;
  forbidden_phrase_hits: string[];
  missing_themes: string[];
  deterministic_pass: boolean;
  tone_score: number | null;
  tone_violations: string[];
  tone_rationale: string | null;
  raw_response: unknown;
  latency_ms: number | null;
  error: string | null;
}

function ResultBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
        pass
          ? "border-foreground/20 text-foreground/60"
          : "border-destructive/60 text-destructive"
      }`}
    >
      {label}
    </span>
  );
}

export default function AdminEvals() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    document.title = "Eval harness";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    const prev = meta.content;
    meta.content = "noindex,nofollow";
    return () => { meta!.content = prev; };
  }, []);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const storedPasscode = sessionStorage.getItem(SESSION_KEY) ?? "";

  const [history, setHistory] = useState<RunSummary[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<{ run: RunSummary; results: ResultRow[] } | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (storedPasscode) {
      setPasscode(storedPasscode);
      setAuthed(true);
    }
  }, [storedPasscode]);

  async function loadHistory(pc: string) {
    const r = await fetch(`${FN_BASE}/fetch-evals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-eval-passcode": pc },
      body: JSON.stringify({ mode: "history", limit: 20 }),
    });
    if (!r.ok) return;
    const data = await r.json();
    setHistory(data.runs ?? []);
  }

  async function loadRun(pc: string, runId: string) {
    setSelectedRun(null);
    const r = await fetch(`${FN_BASE}/fetch-evals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-eval-passcode": pc },
      body: JSON.stringify({ mode: "run", runId }),
    });
    if (!r.ok) return;
    const data = await r.json();
    setSelectedRun(data);
  }

  useEffect(() => {
    if (authed && passcode) loadHistory(passcode);
  }, [authed, passcode]);

  useEffect(() => {
    if (selectedRunId && passcode) loadRun(passcode, selectedRunId);
  }, [selectedRunId, passcode]);

  // Poll the selected run + history while it's still in progress (finished_at == null).
  useEffect(() => {
    if (!authed || !passcode) return;
    const inProgress =
      (selectedRun && !selectedRun.run.finished_at) ||
      history.some((h) => !h.finished_at);
    if (!inProgress) return;
    const id = setInterval(() => {
      loadHistory(passcode);
      if (selectedRunId) loadRun(passcode, selectedRunId);
    }, 4000);
    return () => clearInterval(id);
  }, [authed, passcode, selectedRun, selectedRunId, history]);

  async function submitPasscode(e: React.FormEvent) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError(null);
    try {
      const r = await fetch(`${FN_BASE}/verify-eval-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await r.json();
      if (data.ok) {
        sessionStorage.setItem(SESSION_KEY, passcode);
        setAuthed(true);
      } else {
        setAuthError("Incorrect.");
      }
    } catch {
      setAuthError("Network error.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function runSuite() {
    setRunning(true);
    setRunError(null);
    try {
      const { ALL_SCENARIOS, GLOBAL_FORBIDDEN_PHRASES, GLOBAL_FORBIDDEN_PATTERNS } =
        await import("@/eval/scenarios");
      const r = await fetch(`${FN_BASE}/run-evals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-eval-passcode": passcode },
        body: JSON.stringify({
          scenarios: ALL_SCENARIOS,
          promptVersionTag: tag || null,
          forbiddenPhrases: GLOBAL_FORBIDDEN_PHRASES,
          forbiddenPatterns: GLOBAL_FORBIDDEN_PATTERNS,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setRunError(data.error || `http ${r.status}`);
      } else {
        await loadHistory(passcode);
        setSelectedRunId(data.runId);
      }
    } catch (err) {
      setRunError(String(err));
    } finally {
      setRunning(false);
    }
  }

  if (!authed) {
    return (
      <>
        <main className="min-h-[100dvh] flex items-center justify-center px-6 bg-background">
          <form onSubmit={submitPasscode} className="w-full max-w-sm space-y-4">
            <h1 className="font-serif text-2xl text-foreground">Restricted</h1>
            <p className="text-sm text-muted-foreground">Enter passcode to continue.</p>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground"
              autoFocus
            />
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <button
              type="submit"
              disabled={authBusy || !passcode}
              className="w-full bg-foreground text-background rounded py-2 text-sm disabled:opacity-50"
            >
              {authBusy ? "checking..." : "go"}
            </button>
          </form>
        </main>
      </>
    );
  }

  const tierBreakdown = (() => {
    if (!selectedRun) return null;
    const tiers = ["none", "yellow", "red", "adversarial"];
    return tiers.map((tier) => {
      const rows = selectedRun.results.filter((r) => r.tier === tier);
      const n = rows.length;
      if (n === 0) return null;
      const clsPass = rows.filter((r) => r.classification_pass).length;
      const refPass = rows.filter((r) => r.refusal_pass).length;
      const toneAvg = (() => {
        const scores = rows.map((r) => r.tone_score).filter((s): s is number => s != null);
        if (scores.length === 0) return null;
        return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
      })();
      return { tier, n, clsPass, refPass, toneAvg };
    }).filter(Boolean) as Array<{ tier: string; n: number; clsPass: number; refPass: number; toneAvg: string | null }>;
  })();

  const failures = selectedRun?.results.filter(
    (r) => !r.deterministic_pass || (r.tone_score != null && r.tone_score < 3) || r.error,
  ) ?? [];

  return (
    <>
      <main className="min-h-[100dvh] bg-background text-foreground px-6 py-10 pb-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex items-baseline justify-between border-b border-border pb-4">
            <h1 className="font-serif text-3xl">eval harness</h1>
            <button
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setAuthed(false);
                setPasscode("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              lock
            </button>
          </header>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="prompt version tag (optional)"
                className="flex-1 min-w-[200px] bg-background border border-border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={runSuite}
                disabled={running}
                className="bg-foreground text-background rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {running ? "running suite (~3 min)..." : "run suite"}
              </button>
            </div>
            {runError && <p className="text-sm text-destructive">error: {runError}</p>}
          </section>

          <section className="grid md:grid-cols-[260px_1fr] gap-6">
            <aside className="space-y-2">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground">history</h2>
              {history.length === 0 && <p className="text-sm text-muted-foreground">no runs yet</p>}
              <ul className="space-y-1">
                {history.map((h) => {
                  const passRate = h.total_count > 0 ? Math.round((h.pass_count / h.total_count) * 100) : 0;
                  const active = h.id === selectedRunId;
                  return (
                    <li key={h.id}>
                      <button
                        onClick={() => setSelectedRunId(h.id)}
                        className={`w-full text-left px-3 py-2 rounded text-xs border ${
                          active ? "border-foreground/60 bg-foreground/5" : "border-border hover:border-foreground/40"
                        }`}
                      >
                        <div className="font-mono">{new Date(h.started_at).toLocaleString()}</div>
                        <div className="text-muted-foreground">
                          {h.prompt_version_tag || "(no tag)"} · {passRate}% pass · tone {h.avg_tone_score?.toFixed(2) ?? "-"}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className="space-y-6">
              {!selectedRun && <p className="text-sm text-muted-foreground">select a run to view details</p>}

              {selectedRun && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border border-border rounded p-3">
                      <div className="text-xs text-muted-foreground">pass rate</div>
                      <div className="font-serif text-2xl">
                        {selectedRun.run.total_count > 0
                          ? Math.round((selectedRun.run.pass_count / selectedRun.run.total_count) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="border border-border rounded p-3">
                      <div className="text-xs text-muted-foreground">scenarios</div>
                      <div className="font-serif text-2xl">{selectedRun.run.total_count}</div>
                    </div>
                    <div className="border border-border rounded p-3">
                      <div className="text-xs text-muted-foreground">failures</div>
                      <div className="font-serif text-2xl">{selectedRun.run.fail_count}</div>
                    </div>
                    <div className="border border-border rounded p-3">
                      <div className="text-xs text-muted-foreground">avg tone</div>
                      <div className="font-serif text-2xl">{selectedRun.run.avg_tone_score?.toFixed(2) ?? "-"}/5</div>
                    </div>
                  </div>

                  {tierBreakdown && tierBreakdown.length > 0 && (
                    <div className="border border-border rounded overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                            <th className="text-left p-2">tier</th>
                            <th className="text-right p-2">n</th>
                            <th className="text-right p-2">classification</th>
                            <th className="text-right p-2">refusal</th>
                            <th className="text-right p-2">avg tone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tierBreakdown.map((t) => (
                            <tr key={t.tier} className="border-b border-border last:border-0">
                              <td className="p-2">{t.tier}</td>
                              <td className="p-2 text-right font-mono">{t.n}</td>
                              <td className="p-2 text-right font-mono">{t.clsPass}/{t.n}</td>
                              <td className="p-2 text-right font-mono">{t.refPass}/{t.n}</td>
                              <td className="p-2 text-right font-mono">{t.toneAvg ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
                      failures ({failures.length})
                    </h2>
                    {failures.length === 0 && (
                      <p className="text-sm text-muted-foreground">no failures</p>
                    )}
                    {failures.map((f) => (
                      <details key={f.id} className="border border-border rounded p-3">
                        <summary className="cursor-pointer text-sm flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{f.scenario_id}</span>
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">[{f.tier}]</span>
                          {!f.classification_pass && (
                            <ResultBadge pass={false} label={`cls: ${f.actual_risk_level ?? "?"} vs ${f.expected_risk_level}`} />
                          )}
                          {!f.refusal_pass && (
                            <ResultBadge pass={false} label={`refusal: ${f.refusal_fired} vs ${f.expected_refusal}`} />
                          )}
                          {f.forbidden_phrase_hits.length > 0 && (
                            <ResultBadge pass={false} label={`forbidden: ${f.forbidden_phrase_hits.length}`} />
                          )}
                          {f.missing_themes.length > 0 && (
                            <ResultBadge pass={false} label={`missing themes: ${f.missing_themes.length}`} />
                          )}
                          {f.tone_score != null && f.tone_score < 3 && (
                            <ResultBadge pass={false} label={`tone ${f.tone_score}/5`} />
                          )}
                          {f.error && <ResultBadge pass={false} label="error" />}
                        </summary>
                        <div className="mt-3 space-y-2 text-sm">
                          <div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">input</div>
                            <p className="italic">"{f.input_text}"</p>
                          </div>
                          {f.forbidden_phrase_hits.length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">forbidden hits: </span>
                              <span className="font-mono text-destructive">{f.forbidden_phrase_hits.join(", ")}</span>
                            </div>
                          )}
                          {f.missing_themes.length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">missing themes: </span>
                              <span className="font-mono">{f.missing_themes.join(", ")}</span>
                            </div>
                          )}
                          {f.tone_rationale && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">judge: </span>
                              <span>{f.tone_rationale}</span>
                            </div>
                          )}
                          {f.tone_violations.length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">tone violations: </span>
                              <span className="font-mono">{f.tone_violations.join(" | ")}</span>
                            </div>
                          )}
                          {f.error && (
                            <div className="text-xs text-destructive font-mono">{f.error}</div>
                          )}
                          {f.raw_response != null && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">raw response</summary>
                              <pre className="mt-2 p-2 bg-foreground/5 rounded overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(f.raw_response, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
