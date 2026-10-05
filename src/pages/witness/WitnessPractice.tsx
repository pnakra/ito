import { useState } from "react";
import { Lock } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { PRACTICE, type PracticeChoice, type PracticeScenario } from "@/data/witness";

const STORE = "ito_witness_practice_v1";
type Scores = Record<string, number>;
const loadScores = (): Scores => {
  try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch { return {}; }
};

const Play = ({ s, onDone }: { s: PracticeScenario; onDone: (score: number) => void }) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pressure, setPressure] = useState(2);
  const [picked, setPicked] = useState<PracticeChoice | null>(null);
  const [finished, setFinished] = useState(false);
  const max = s.rounds.length * 3;
  const r = s.rounds[round];

  const pick = (c: PracticeChoice) => {
    setPicked(c);
    setScore((x) => x + c.points);
    setPressure((p) => Math.max(0, Math.min(5, p + c.pressure)));
  };
  const next = () => {
    setPicked(null);
    if (round + 1 < s.rounds.length) setRound(round + 1);
    else setFinished(true);
  };

  if (finished) {
    return (
      <div className="space-y-5">
        <div className="font-mono text-[40px] text-foreground">{score}/{max}</div>
        <p className="text-foreground/90">{score === max ? "Every move was the strong one." : "Run it again and see if an earlier move changes things."}</p>
        <div className="rounded-lg border border-border p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">What you'd say for real</div>
          <div className="font-serif italic text-[20px] text-foreground">{s.sayForReal}</div>
        </div>
        <Button onClick={() => onDone(score)} size="lg" className="w-full">Back to scenarios</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>round {round + 1}/{s.rounds.length}</span>
        <span>score {score}</span>
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">group pressure</div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded ${i < pressure ? "bg-signal-pause" : "bg-muted"}`} />
          ))}
        </div>
      </div>
      {round === 0 && <p className="text-muted-foreground">{s.setup}</p>}
      <div className="space-y-2">
        {r.messages.map((m, i) => (
          <div key={i} className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-2 animate-fade-in" style={{ animationDelay: `${i * 300}ms`, animationFillMode: "both" }}>
            <div className="text-[11px] text-muted-foreground">{m.from}</div>
            <div className="text-foreground">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="font-semibold text-foreground">{r.prompt}</div>
      {picked ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="text-xs font-mono text-muted-foreground">{picked.d !== "None" ? picked.d : "no move"} · +{picked.points}</div>
            <div className="text-foreground">{picked.feedback}</div>
          </div>
          <Button onClick={next} size="lg" className="w-full">Go</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {r.choices.map((c) => (
            <Button key={c.text} variant="outline" size="lg" className="justify-start h-auto py-4 whitespace-normal text-left" onClick={() => pick(c)}>
              {c.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const WitnessPractice = () => {
  const [scores, setScores] = useState<Scores>(loadScores);
  const [active, setActive] = useState<PracticeScenario | null>(null);

  const done = (id: string, score: number) => {
    const next = { ...scores, [id]: Math.max(scores[id] ?? 0, score) };
    setScores(next);
    try { localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* noop */ }
    setActive(null);
  };

  const tracks = [
    { id: "him" as const, label: "It's him", sub: "A friend or brother is heading toward something." },
    { id: "you" as const, label: "It's you", sub: "You're the one with momentum." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Practice | ito for witnesses" description="Practice stepping in before it's real." path="/witness/practice" noindex />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12 pb-12">
        <div className="max-w-xl mx-auto space-y-8">
          <BackButton to="/witness" />
          {active ? (
            <>
              <h1 className="text-h2 text-foreground">{active.title}</h1>
              <Play key={active.id} s={active} onDone={(sc) => done(active.id, sc)} />
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-h1 text-foreground">Practice</h1>
                <p className="text-muted-foreground">Earlier moves score higher. Finish one to unlock the next. Scores stay on this device only.</p>
              </div>
              {tracks.map((t) => {
                const list = PRACTICE.filter((p) => p.track === t.id);
                return (
                  <section key={t.id} className="space-y-3">
                    <div>
                      <h2 className="font-serif text-[22px] text-foreground">{t.label}</h2>
                      <p className="text-sm text-muted-foreground">{t.sub}</p>
                    </div>
                    {list.map((p, i) => {
                      const locked = i > 0 && scores[list[i - 1].id] === undefined;
                      const best = scores[p.id];
                      return (
                        <button
                          key={p.id}
                          disabled={locked}
                          onClick={() => setActive(p)}
                          className="w-full text-left rounded-lg border border-border p-4 hover:border-foreground/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                        >
                          <span className="font-medium text-foreground">{p.title}</span>
                          <span className="font-mono text-sm text-muted-foreground">
                            {locked ? <Lock className="w-4 h-4" /> : best !== undefined ? `best ${best}/${p.rounds.length * 3}` : "new"}
                          </span>
                        </button>
                      );
                    })}
                  </section>
                );
              })}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default WitnessPractice;
