import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Shuffle, Share2, Check } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Textarea } from "@/components/ui/textarea";
import { PREVIEW_SCENARIOS, RESPONSE_STYLES, pickNextScenario, type PreviewScenario, type ResponseStyle } from "@/data/previewScenarios";
import { invokeEdgeFunctionWithRetry } from "@/lib/invokeEdgeFunctionWithRetry";
import { classifyRisk } from "@/lib/riskClassification";
import { detectGaps, narrativeToDecisionState } from "@/lib/narrativeGapDetection";
import { supabase } from "@/integrations/supabase/client";

type Stage = "respond" | "loading" | "reveal";
type Alignment = "aligned" | "somewhat" | "not_really";

interface ItoResponse {
  signalLabel: string;
  why: string[];
  suggestion: string;
}

const cleanText = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const cleanList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean) : [];

const TILE_BG = "#12141C";
const TILE_BORDER = "#212631";
const ACCENT = "#6366f1";
const ACCENT_SOFT = "rgba(99, 102, 241, 0.15)";
const PAGE_BG = "#08090D";

const ALIGNMENT_OPTIONS: { id: Alignment; label: string }[] = [
  { id: "aligned", label: "Pretty aligned" },
  { id: "somewhat", label: "Somewhat" },
  { id: "not_really", label: "Not really" },
];

const pickScenarioFromParam = (): { scenario: PreviewScenario; wasShared: boolean } => {
  if (typeof window === "undefined") return { scenario: pickNextScenario(), wasShared: false };
  const params = new URLSearchParams(window.location.search);
  const sharedId = params.get("s");
  if (sharedId) {
    const match = PREVIEW_SCENARIOS.find((s) => s.id === sharedId);
    if (match) return { scenario: match, wasShared: true };
  }
  return { scenario: pickNextScenario(), wasShared: false };
};

const SeeHowItoResponds = () => {
  const initial = pickScenarioFromParam();
  const [scenario, setScenario] = useState<PreviewScenario>(initial.scenario);
  const [wasShared, setWasShared] = useState<boolean>(initial.wasShared);
  const [stage, setStage] = useState<Stage>("respond");
  const [userResponse, setUserResponse] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ResponseStyle | null>(null);
  const [itoResponse, setItoResponse] = useState<ItoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!copiedShare) return;
    const t = setTimeout(() => setCopiedShare(false), 2000);
    return () => clearTimeout(t);
  }, [copiedShare]);

  const handleNewScenario = () => {
    setScenario(pickNextScenario(scenario));
    setWasShared(false);
    setStage("respond");
    setUserResponse("");
    setSelectedStyle(null);
    setItoResponse(null);
    setError(null);
    setAlignment(null);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const handleAlignment = async (id: Alignment) => {
    if (alignment) return;
    setAlignment(id);
    try {
      await supabase.from("submissions").insert({
        flow_type: "preview",
        step_name: "alignment_check",
        step_type: "choice",
        choice_value: id,
        metadata: {
          scenario_id: scenario.id,
          scenario_theme: scenario.theme,
          selected_style: selectedStyle,
          signal_label: itoResponse?.signalLabel ?? null,
        },
      });
    } catch (e) {
      console.error("[preview] alignment log failed", e);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/preview?s=${scenario.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "See how ito responds",
          text: "Try this one — what would you say?",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedShare(true);
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedShare(true);
      } catch {
        // no-op
      }
    }
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
          detectedTiming: "before",
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
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(99, 102, 241, 0.8)" }}>
            ito / preview
          </span>
          <div className="flex gap-1">
            <div className="w-4 h-1 rounded-full" style={{ background: ACCENT }} />
            <div className="w-1.5 h-1 rounded-full" style={{ background: TILE_BORDER }} />
            <div className="w-1.5 h-1 rounded-full" style={{ background: TILE_BORDER }} />
          </div>
        </div>
        <h1 className="sr-only">See how ito responds</h1>

        {wasShared && stage === "respond" && (
          <div
            className="mb-3 px-3 py-2 rounded-full text-[11px] inline-flex items-center gap-1.5"
            style={{ background: ACCENT_SOFT, color: ACCENT, border: `1px solid rgba(99, 102, 241, 0.25)` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
            Someone sent you this one
          </div>
        )}


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
                const wideBg = active ? "rgba(99, 102, 241, 0.08)" : TILE_BG;
                const wideBorder = active ? "rgba(99, 102, 241, 0.5)" : TILE_BORDER;
                const wideIconBg = active ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.05)";
                const wideIconBorder = active ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.1)";
                const wideIconLine = active ? ACCENT : "rgba(99, 102, 241, 0.4)";
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleClick(style.id)}
                    className={`col-span-6 ${baseClass} ${activeClass} flex items-center justify-between gap-4 active:scale-[0.98]`}
                    style={{ background: wideBg, border: `1px solid ${wideBorder}` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: wideIconBg, border: `1px solid ${wideIconBorder}` }}
                      >
                        <div className="w-4 h-1 rounded-full" style={{ background: wideIconLine }} />
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

            {/* Alignment check */}
            <div className="col-span-6 p-5 rounded-[28px]" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: "#64748b" }}>
                How close was your read?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ALIGNMENT_OPTIONS.map((opt) => {
                  const active = alignment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAlignment(opt.id)}
                      disabled={!!alignment}
                      className="min-h-11 rounded-full px-3 py-2 text-[11px] font-semibold leading-tight transition-all active:scale-95 disabled:cursor-default"
                      style={{
                        background: active ? ACCENT : "transparent",
                        color: active ? "#fff" : "#cbd5e1",
                        border: `1px solid ${active ? ACCENT : TILE_BORDER}`,
                        opacity: alignment && !active ? 0.4 : 1,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {alignment && (
                <p className="text-[11px] mt-3 text-center" style={{ color: "#64748b" }}>
                  Thanks — that helps calibrate how ito is landing.
                </p>
              )}
            </div>

            {/* Share */}
            <div className="col-span-6">
              <button
                onClick={handleShare}
                className="w-full h-11 rounded-full text-[13px] font-semibold border transition-all active:scale-95 inline-flex items-center justify-center gap-2"
                style={{ background: "transparent", borderColor: TILE_BORDER, color: "#e2e8f0" }}
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4" style={{ color: ACCENT }} />
                    Link copied
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Send this scenario to someone
                  </>
                )}
              </button>
            </div>

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
