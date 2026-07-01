import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Shuffle, Share2, Check, Lock } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
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

const readCampaignParams = () => {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"].forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v;
  });
  if (typeof document !== "undefined" && document.referrer) out.referrer = document.referrer;
  return out;
};

const logPreviewEvent = async (
  step_name: string,
  extra: { choice_value?: string; metadata?: Record<string, unknown> } = {}
) => {
  try {
    await supabase.from("submissions").insert([{
      flow_type: "preview",
      step_name,
      step_type: "event",
      choice_value: extra.choice_value ?? null,
      metadata: { ...readCampaignParams(), ...(extra.metadata ?? {}) } as any,
    }]);
  } catch (e) {
    console.error("[preview] log failed", step_name, e);
  }
};

const SeeHowItoResponds = () => {
  const initial = pickScenarioFromParam();
  const [scenario, setScenario] = useState<PreviewScenario>(initial.scenario);
  const [wasShared, setWasShared] = useState<boolean>(initial.wasShared);
  const [stage, setStage] = useState<Stage>("respond");
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

  // Track landing (fires once per mount)
  useEffect(() => {
    logPreviewEvent("preview_view", {
      metadata: { scenario_id: initial.scenario.id, was_shared: initial.wasShared },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewScenario = () => {
    const next = pickNextScenario(scenario);
    logPreviewEvent("another_scenario", {
      metadata: { from: scenario.id, to: next.id, at_stage: stage },
    });
    setScenario(next);
    setWasShared(false);
    setStage("respond");
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
    logPreviewEvent("alignment_check", {
      choice_value: id,
      metadata: {
        scenario_id: scenario.id,
        scenario_theme: scenario.theme,
        selected_style: selectedStyle,
        signal_label: itoResponse?.signalLabel ?? null,
      },
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/preview?s=${scenario.id}`;
    logPreviewEvent("share_click", { metadata: { scenario_id: scenario.id } });
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

  const handleStyleSelect = (id: ResponseStyle) => {
    if (stage !== "respond") return;
    setSelectedStyle((prev) => (prev === id ? null : id));
    setError(null);
  };

  const handleReveal = async () => {
    if (!selectedStyle || stage !== "respond") return;
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

  const chosenStyle = selectedStyle ? RESPONSE_STYLES.find((s) => s.id === selectedStyle) : null;

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: PAGE_BG }}>
      <SEO
        title="See how ito responds — preview real scenarios"
        description="Read a real-feeling situation, pick how you'd handle it, then see how ito reads the moment."
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
            <div className={`h-1 rounded-full transition-all ${stage === "respond" ? "w-4" : "w-1.5"}`} style={{ background: stage === "respond" ? ACCENT : TILE_BORDER }} />
            <div className={`h-1 rounded-full transition-all ${stage === "reveal" ? "w-4" : "w-1.5"}`} style={{ background: stage === "reveal" ? ACCENT : TILE_BORDER }} />
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
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* Scenario tile */}
            <div className="p-6 rounded-[28px]" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
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
              <p className="text-[17px] leading-[1.5] font-normal text-slate-100">
                {scenario.scenario_text}
              </p>
            </div>

            {/* Prompt */}
            <div className="px-1 pt-2 pb-1">
              <p className="text-[13px] font-medium text-slate-300">
                How would you handle this?
              </p>
            </div>

            {/* Style cards — three uniform emoji cards in clear sequence */}
            <div className="grid grid-cols-3 gap-2">
              {RESPONSE_STYLES.map((style, i) => {
                const active = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    className="rounded-[24px] p-4 pt-5 flex flex-col items-center gap-2 transition-all active:scale-95 hover:border-indigo-500/40 relative"
                    style={{
                      background: active ? "rgba(99, 102, 241, 0.1)" : TILE_BG,
                      border: `1px solid ${active ? "rgba(99, 102, 241, 0.5)" : TILE_BORDER}`,
                      minHeight: 140,
                    }}
                  >
                    <span
                      className="absolute top-2.5 left-3 text-[9px] font-bold tracking-widest tabular-nums"
                      style={{ color: "#475569" }}
                    >
                      0{i + 1}
                    </span>
                    <span className="text-[36px] leading-none mt-1" aria-hidden>
                      {style.emoji}
                    </span>
                    <div className="flex flex-col items-center gap-0.5 mt-auto">
                      <span className="text-[13px] font-semibold text-slate-100 leading-tight">
                        {style.vibe}
                      </span>
                      <span className="text-[10.5px] leading-tight text-center" style={{ color: "#94a3b8" }}>
                        {style.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Intensity spectrum hint */}
            <div className="flex items-center gap-2 px-1 mt-1 text-[10px]" style={{ color: "#475569" }}>
              <span>More direct</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(99,102,241,0.4), rgba(99,102,241,0.05))" }} />
              <span>Softer</span>
            </div>

            {/* Preview of the chosen response + reveal CTA */}
            {selectedStyle && (() => {
              const s = RESPONSE_STYLES.find((x) => x.id === selectedStyle)!;
              const starter = scenario.starters[selectedStyle];
              return (
                <div className="mt-2 flex flex-col gap-3 animate-fade-in">
                  <div
                    className="p-5 rounded-[24px]"
                    style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#64748b" }}>
                        Your take · {s.vibe}
                      </span>
                      <span className="text-[20px] leading-none" aria-hidden>{s.emoji}</span>
                    </div>
                    <p className="text-[14px] leading-relaxed" style={{ color: "#e2e8f0" }}>
                      {starter}
                    </p>
                  </div>
                  <button
                    onClick={handleReveal}
                    className="w-full h-12 rounded-full text-[14px] font-bold tracking-tight transition-all active:scale-95 shadow-lg inline-flex items-center justify-center gap-2"
                    style={{ background: ACCENT, color: "#fff", boxShadow: "0 0 24px rgba(99, 102, 241, 0.3)" }}
                  >
                    Reveal ito's read
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}
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
        {stage === "reveal" && itoResponse && chosenStyle && (
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* Your pick */}
            <div className="p-5 rounded-[28px]" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#64748b" }}>
                  Your take · {chosenStyle.vibe}
                </p>
                <span className="text-[20px] leading-none" aria-hidden>{chosenStyle.emoji}</span>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: "#e2e8f0" }}>
                {scenario.starters[chosenStyle.id]}
              </p>
            </div>

            {/* ito's read — short */}
            <div className="p-5 rounded-[28px]" style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.35)" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: ACCENT }}>ito's read</p>
              <p className="text-[15px] font-semibold text-white mb-1.5">{itoResponse.signalLabel}</p>
              {itoResponse.why[0] && (
                <p className="text-[13.5px] leading-relaxed" style={{ color: "#cbd5e1" }}>
                  {itoResponse.why[0]}
                </p>
              )}
            </div>

            {/* Locked / teaser */}
            <div
              className="p-4 rounded-[24px] flex items-center gap-3"
              style={{ background: TILE_BG, border: `1px dashed ${TILE_BORDER}` }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)" }}
              >
                <Lock className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] font-medium text-slate-200 leading-snug">
                  ito goes deeper with your own situation.
                </p>
                <p className="text-[11px] leading-snug" style={{ color: "#64748b" }}>
                  Previews stay short on purpose.
                </p>
              </div>
            </div>

            {/* Alignment check */}
            <div className="p-5 rounded-[28px]" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
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
            </div>

            {/* Share */}
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

            {/* CTAs */}
            <div className="p-5 rounded-[28px] text-center" style={{ background: TILE_BG, border: `1px solid ${TILE_BORDER}` }}>
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
        {stage === "respond" && (
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
