import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Shuffle } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PREVIEW_SCENARIOS, RESPONSE_STYLES, type PreviewScenario, type ResponseStyle } from "@/data/previewScenarios";
import { invokeEdgeFunctionWithRetry } from "@/lib/invokeEdgeFunctionWithRetry";
import { classifyRisk } from "@/lib/riskClassification";
import { detectGaps, narrativeToDecisionState } from "@/lib/narrativeGapDetection";

type Stage = "respond" | "loading" | "reveal";

interface ItoResponse {
  signalLabel: string;
  why: string[];
  suggestion: string;
}

const cleanText = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const cleanList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean) : [];

const pickRandom = (exceptId?: string) => {
  const pool = exceptId ? PREVIEW_SCENARIOS.filter((s) => s.id !== exceptId) : PREVIEW_SCENARIOS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const SeeHowItoResponds = () => {
  const [scenario, setScenario] = useState<PreviewScenario>(() => pickRandom());
  const [stage, setStage] = useState<Stage>("respond");
  const [userResponse, setUserResponse] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ResponseStyle | null>(null);
  const [itoResponse, setItoResponse] = useState<ItoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNewScenario = () => {
    setScenario(pickRandom(scenario.id));
    setStage("respond");
    setUserResponse("");
    setSelectedStyle(null);
    setItoResponse(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!userResponse.trim() && !selectedStyle) return;
    setStage("loading");
    setError(null);

    try {
      // Compute risk the same way the real ito flow does
      const text = scenario.scenario_text;
      const gapResult = detectGaps(text);
      const decisionState = narrativeToDecisionState(text, gapResult.detectedTiming);
      const risk = classifyRisk(decisionState);

      const data = await invokeEdgeFunctionWithRetry<Record<string, unknown>>(
        "analyze-narrative",
        {
          narrativeText: text,
          precomputedRiskLevel: risk.level,
          detectedTiming: gapResult.detectedTiming,
          isFollowUp: false,
          structuredSignals: {},
          entryMethod: "typed",
        },
        { maxRetries: 2, baseDelayMs: 500, label: "preview-analyze" }
      );

      setItoResponse({
        signalLabel: cleanText(data?.signalLabel) || "Worth a pause",
        why: cleanList(data?.why),
        suggestion: cleanText(data?.suggestion),
      });
      setStage("reveal");
    } catch (e) {
      console.error("[preview] ito response failed", e);
      setError("ito couldn't respond right now. Try again in a moment.");
      setStage("respond");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <SEO
        title="See how ito responds — preview real scenarios"
        description="Read a real-feeling situation, write what you'd say, then see how ito responds. A short preview of how the tool reads a moment."
        path="/preview"
      />
      <Header />

      <main className="flex-1 container mx-auto max-w-2xl px-5 pt-6 pb-12">
        {/* Eyebrow */}
        <div className="mb-6">
          <p className="text-[12px] uppercase tracking-[0.18em] text-[hsl(var(--accent-amber,30_70%_38%))] mb-2" style={{ color: "#B07010" }}>
            See how ito responds
          </p>
          <h1
            className="text-foreground"
            style={{
              fontFamily: '"Newsreader", "Georgia", serif',
              fontSize: "32px",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.3px",
              fontStyle: "italic",
              color: "#F0EDE4",
            }}
          >
            what would you tell them?
          </h1>
        </div>

        {/* Scenario card */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "rgba(64, 139, 33, 0.08)", border: "1px solid rgba(64, 139, 33, 0.25)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Scenario · {scenario.narrator_gender === "male" ? "he" : "she"}/them
            </span>
            <button
              onClick={handleNewScenario}
              className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              aria-label="new scenario"
            >
              <Shuffle className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[15px] text-foreground/90 leading-relaxed">{scenario.scenario_text}</p>
        </div>

        {/* Respond stage */}
        {stage === "respond" && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <p className="text-[14px] text-foreground font-medium mb-3">What would you lead with?</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {RESPONSE_STYLES.map((style) => {
                  const active = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => {
                        if (active) {
                          setSelectedStyle(null);
                          return;
                        }
                        setSelectedStyle(style.id);
                        // Only prefill if the textarea is empty or still holds another starter for this scenario
                        const otherStarters = Object.values(scenario.starters);
                        if (!userResponse.trim() || otherStarters.includes(userResponse)) {
                          setUserResponse(scenario.starters[style.id]);
                        }
                      }}
                      className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="text-[13px] font-semibold text-foreground">{style.label}</div>
                    </button>
                  );
                })}
              </div>
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value.slice(0, 600))}
                placeholder="Type what you'd actually say to them…"
                className="min-h-[100px] resize-none rounded-xl"
              />
              <div className="text-right text-[11px] text-muted-foreground mt-1">{userResponse.length}/600</div>
            </div>

            {error && <p className="text-[13px] text-destructive">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={!userResponse.trim() && !selectedStyle}
              className="w-full h-12 text-[15px]"
            >
              See how ito responds <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Loading */}
        {stage === "loading" && (
          <div className="py-12 flex flex-col items-center gap-3 animate-fade-in">
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <p className="text-[13px] text-muted-foreground">ito is reading it…</p>
          </div>
        )}

        {/* Reveal */}
        {stage === "reveal" && itoResponse && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              {/* User's take */}
              <div className="rounded-2xl p-4 border border-border bg-card">
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Your instinct</p>
                {selectedStyle && (
                  <div className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded mb-2"
                    style={{ background: "rgba(176, 112, 16, 0.18)", color: "#B07010" }}>
                    {RESPONSE_STYLES.find((s) => s.id === selectedStyle)?.label}
                  </div>
                )}
                <p className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {userResponse.trim() || (
                    <span className="italic text-muted-foreground">
                      {RESPONSE_STYLES.find((s) => s.id === selectedStyle)?.label}
                    </span>
                  )}
                </p>
              </div>

              {/* ito's take */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(64, 139, 33, 0.10)", border: "1px solid rgba(64, 139, 33, 0.35)" }}
              >
                <p className="text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: "#408b21" }}>
                  ito's read
                </p>
                <p className="text-[15px] font-semibold text-foreground mb-2">{itoResponse.signalLabel}</p>
                {itoResponse.why.length > 0 && (
                  <ul className="space-y-1.5 mb-3">
                    {itoResponse.why.map((point, i) => (
                      <li key={i} className="text-[13.5px] text-foreground/85 leading-relaxed flex gap-2">
                        <span style={{ color: "#408b21" }}>·</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {itoResponse.suggestion && (
                  <p className="text-[13.5px] text-foreground/90 leading-relaxed italic border-t border-foreground/10 pt-3">
                    {itoResponse.suggestion}
                  </p>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(240, 237, 228, 0.04)", border: "1px solid rgba(240, 237, 228, 0.10)" }}>
              <p className="text-[15px] text-foreground mb-1 font-medium">Have your own situation?</p>
              <p className="text-[13px] text-muted-foreground mb-4">
                These scenarios are made up. Yours doesn't have to be.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link to="/check-in" className="flex-1">
                  <Button className="w-full h-11">
                    Try ito with your own <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleNewScenario} className="flex-1 h-11">
                  <RefreshCw className="mr-1.5 w-4 h-4" /> Try another scenario
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SeeHowItoResponds;
