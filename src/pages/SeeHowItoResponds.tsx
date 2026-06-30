import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Shuffle } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
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

const scenarioIndex = (id: string) => PREVIEW_SCENARIOS.findIndex((s) => s.id === id) + 1;

const TILE_BG = "#12141C";
const TILE_BORDER = "#212631";
const ACCENT = "#6366f1";
const ACCENT_SOFT = "rgba(99, 102, 241, 0.15)";
const PAGE_BG = "#08090D";

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

  const handleStyleClick = (id: ResponseStyle) => {
    if (selectedStyle === id) {
      setSelectedStyle(null);
      return;
    }
    setSelectedStyle(id);
    const otherStarters = Object.values(scenario.starters);
    if (!userResponse.trim() || otherStarters.includes(userResponse)) {
      setUserResponse(scenario.starters[id]);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: PAGE_BG }}>
      <SEO
        title="See how ito responds — preview real scenarios"
        description="Read a real-feeling situation, write what you'd say, then see how ito responds. A short preview of how the tool reads a moment."
        path="/preview"
      />
      <Header />

      <main className="flex-1 container mx-auto max-w-[420px] px-5 pt-6 pb-12">
        {/* Header */}
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(99, 102, 241, 0.8)" }}>
              ito / preview
            </span>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Scenario {String(scenarioIndex(scenario.id)).padStart(2, "0")}
            </h1>
          </div>
          <div className="flex gap-1 mb-1.5">
            <div className="w-4 h-1 rounded-full" style={{ background: ACCENT }} />
            <div className="w-1.5 h-1 rounded-full" style={{ background: TILE_BORDER }} />
            <div className="w-1.5 h-1 rounded-full" style={{ background: TILE_BORDER }} />
          </div>
        </div>

        {/* Respond stage */}
        {stage === "respond" && (
          <div className="grid grid-cols-6 gap-3 animate-fade-in">
            {/* Scenario tile */}
            <div className="col-span-6 p-6 rounded-[28px]" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#64748b" }}>
                  Scenario · {scenario.narrator_gender === "male" ? "he" : "she"}/them
                </span>
                <button
                  onClick={handleNewScenario}
                  className="inline-flex items-center gap-1 transition-colors"
                  style={{ color: "#64748b" }}
                  aria-label="new scenario"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
              <p
                className="text-[22px] leading-[1.3] text-slate-100 italic"
                style={{ fontFamily: '"Newsreader", "Georgia", serif' }}
              >
                {scenario.scenario_text}
              </p>
            </div>

            {/* Style tiles */}
            {RESPONSE_STYLES.map((style, i) => {
              const active = selectedStyle === style.id;
              const isWide = i === 2;
              const baseClass = "rounded-[28px] p-5 transition-all cursor-pointer";
              const activeClass = active ? "ring-1" : "hover:border-indigo-500/30";
              const border = { border: `1px solid ${active ? "rgba(99, 102, 241, 0.5)" : TILE_BORDER}` };
              const bg = { background: active ? "rgba(99, 102, 241, 0.08)" : TILE_BG };

              if (isWide) {
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleClick(style.id)}
                    className={`col-span-6 ${baseClass} ${activeClass} flex items-center justify-between gap-4 active:scale-[0.98]`}
                    style={{ ...bg, ...border }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: active ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.05)", border: `1px solid ${active ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.1)"}` }
                      >
                        <div className="w-4 h-1 rounded-full" style={{ background: active ? ACCENT : "rgba(99, 102, 241, 0.4)" }} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "#64748b" }}>
                          Style {String.fromCharCode(65 + i)}
                        </p>
                        <p className="text-sm font-medium text-slate-200">{style.label}</p>
                      </div>
                    </div>
                    <div className="pr-2" style={{ opacity: active ? 1 : 0.3 }}>
                      <ArrowRight className="w-4 h-4" style={{ color: ACCENT }} />
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleClick(style.id)}
                  className={`col-span-3 aspect-square ${baseClass} ${activeClass} flex flex-col justify-between active:scale-95`}
                  style={{ ...bg, ...border }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: active ? "rgba(99, 102, 241, 0.15)" : i === 0 ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                      border: `1px solid ${active ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.15)"}`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: active ? ACCENT : i === 0 ? "rgba(99, 102, 241, 0.7)" : "rgba(99, 102, 241, 0.4)" }}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "#64748b" }}>
                      Style {String.fromCharCode(65 + i)}
                    </p>
                    <p className="text-sm font-medium text-slate-200">{style.label}</p>
                  </div>
                </button>
              );
            })}

            {/* Input area */}
            <div className="col-span-6 mt-1">
              <div className="relative group">
                <Textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value.slice(0, 600))}
                  placeholder="How would you respond?"
                  className="w-full min-h-[144px] resize-none rounded-[32px] p-6 pt-5 text-sm shadow-inner transition-all focus:ring-4 focus-visible:ring-4 focus:ring-indigo-500/5"
                  style={{
                    background: TILE_BG,
                    border: `1px solid ${TILE_BORDER}`,
                    color: "#f1f5f9",
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!userResponse.trim() && !selectedStyle}
                  className="absolute bottom-4 right-4 h-10 px-6 rounded-full text-[13px] font-bold tracking-tight transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  style={{ background: ACCENT, color: "#fff", boxShadow: "0 0 20px rgba(99, 102, 241, 0.25)" }}
                >
                  Reveal
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-[28px] text-center text-[13px]" style={{ background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.25)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {stage === "loading" && (
          <div className="py-16 flex flex-col items-center gap-4 animate-fade-in">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: ACCENT }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: ACCENT, animationDelay: "0.15s" }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: ACCENT, animationDelay: "0.3s" }} />
            </div>
            <p className="text-[13px]" style={{ color: "#64748b" }}>ito is reading it…</p>
          </div>
        )}

        {/* Reveal */}
        {stage === "reveal" && itoResponse && (
          <div className="grid grid-cols-6 gap-3 animate-fade-in">
            {/* User's take */}
            <div className="col-span-6 md:col-span-3 p-5 rounded-[28px]" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: "#64748b" }}>Your instinct</p>
              {selectedStyle && (
                <div
                  className="inline-block text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full mb-3"
                  style={{ background: "rgba(99, 102, 241, 0.15)", color: ACCENT }}
                >
                  {RESPONSE_STYLES.find((s) => s.id === selectedStyle)?.label}
                </div>
              )}
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "#e2e8f0" }}>
                {userResponse.trim() || (
                  <span className="italic" style={{ color: "#64748b" }}>
                    {RESPONSE_STYLES.find((s) => s.id === selectedStyle)?.label}
                  </span>
                )}
              </p>
            </div>

            {/* ito's take */}
            <div className="col-span-6 md:col-span-3 p-5 rounded-[28px]" style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.35)" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: ACCENT }}>ito's read</p>
              <p className="text-[15px] font-semibold text-white mb-2">{itoResponse.signalLabel}</p>
              {itoResponse.why.length > 0 && (
                <ul className="space-y-1.5 mb-3">
                  {itoResponse.why.map((point, i) => (
                    <li key={i} className="text-[13.5px] leading-relaxed flex gap-2" style={{ color: "#cbd5e1" }}>
                      <span style={{ color: ACCENT }}>·</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
              {itoResponse.suggestion && (
                <p className="text-[13.5px] leading-relaxed italic border-t pt-3" style={{ color: "#e2e8f0", borderColor: "rgba(255,255,255,0.1)" }}>
                  {itoResponse.suggestion}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="col-span-6 p-5 rounded-[28px] text-center" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
              <p className="text-[15px] text-white mb-1 font-medium">Have your own situation?</p>
              <p className="text-[13px] mb-4" style={{ color: "#64748b" }}>
                These scenarios are made up. Yours doesn't have to be.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/check-in">
                  <button
                    className="w-full h-11 rounded-full text-[14px] font-semibold transition-all active:scale-95"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    Try ito with your own <ArrowRight className="inline-block ml-1.5 w-4 h-4 align-text-bottom" />
                  </button>
                </Link>
                <button
                  onClick={handleNewScenario}
                  className="w-full h-11 rounded-full text-[14px] font-semibold border transition-all active:scale-95"
                  style={{ background: "transparent", borderColor: TILE_BORDER, color: "#e2e8f0" }}
                >
                  <RefreshCw className="inline-block mr-1.5 w-4 h-4 align-text-bottom" /> Try another scenario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Try another */}
        {stage !== "reveal" && (
          <div className="text-center mt-6">
            <button
              onClick={handleNewScenario}
              className="text-[11px] font-medium uppercase tracking-widest transition-colors"
              style={{ color: "#64748b" }}
            >
              Try another scenario
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SeeHowItoResponds;
