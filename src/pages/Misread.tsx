import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

const PAGE_BG = "#08090D";
const BUBBLE_BG = "#1C1E26";
const REPLY_BG = "#12141C";
const REPLY_BORDER = "#22252F";
const ACCENT = "#E8A87C";
const FLAG_TINT = "rgba(232, 168, 124, 0.10)";
const FLAG_BORDER = "rgba(232, 168, 124, 0.35)";

// Matches remotion-tiktok MISREAD_V2
const SCENARIO = {
  timestamp: "2:14 am",
  message: "you think she was into it right? like i didn't misread it?",
  replies: [
    { text: "hey. what does she say when you ask her?" },
    { text: "if you're asking me, you already know" },
    { text: "haha bro you're fine, don't overthink it" },
  ],
  flaggedIndex: 2,
  signalLabel: "letting him off the hook",
  itoRead: [
    "\"haha you're fine\" ends the question before he has to sit with it.",
    "the fact that he's asking at 2am means part of him already knows something felt off.",
    "a friend who cares says: what does she say when you ask her?",
  ],
};

const readCampaignParams = () => {
  if (typeof window === "undefined") return {} as Record<string, string>;
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"].forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v;
  });
  if (typeof document !== "undefined" && document.referrer) out.referrer = document.referrer;
  return out;
};

const SLACK_EVENTS = new Set(["misread_reply_tapped", "misread_reveal_viewed", "misread_cta_clicked"]);

const logEvent = async (step_name: string, extra: Record<string, unknown> = {}) => {
  const metadata = { ...readCampaignParams(), ...extra, landing: "misread" };
  if (SLACK_EVENTS.has(step_name)) {
    supabase.functions
      .invoke("notify-preview-slack", {
        body: {
          event: step_name,
          scenario_id: "misread",
          scenario_theme: "misread",
          selected_style: (extra as any).reply_index ?? null,
          signal_label: SCENARIO.signalLabel,
          utm: readCampaignParams(),
          referrer: (readCampaignParams() as any).referrer,
        },
      })
      .catch((e) => console.error("[misread] slack failed", step_name, e));
  }
  try {
    await supabase.from("submissions").insert([{
      flow_type: "preview",
      step_name,
      step_type: "event",
      choice_value: (extra as any).reply_index?.toString() ?? null,
      metadata: metadata as any,
    }]);
  } catch (e) {
    console.error("[misread] log failed", step_name, e);
  }
};

const Misread = () => {
  const navigate = useNavigate();
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Suppress the check-in intro modal for these visitors — the scenario IS the intro.
    try {
      localStorage.setItem("ito_preview_intro_seen_v1", "1");
      localStorage.setItem("ito_preview_cta_taken_v1", "1");
    } catch { /* noop */ }
    logEvent("misread_landed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = (index: number) => {
    if (tappedIndex !== null) return;
    setTappedIndex(index);
    logEvent("misread_reply_tapped", { reply_index: index, is_flagged: index === SCENARIO.flaggedIndex });
    // Show reveal after brief pause so the tap feedback registers
    window.setTimeout(() => {
      setRevealed(true);
      logEvent("misread_reveal_viewed", { reply_index: index });
    }, 500);
  };

  const handleCta = () => {
    logEvent("misread_cta_clicked", { reply_index: tappedIndex });
    navigate("/check-in");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: PAGE_BG, color: "#F5F1E8" }}>
      <SEO
        title="you think she was into it right? — ito"
        description="if you're asking, part of you already knows. see how ito reads it."
        path="/misread"
      />

      <main className="flex-1 container mx-auto max-w-[420px] px-5 pt-8 pb-16" style={{ fontFamily: "Geist, system-ui, sans-serif" }}>
        {/* Timestamp */}
        <div className="text-center mb-6">
          <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "#666" }}>
            {SCENARIO.timestamp}
          </span>
        </div>

        {/* Incoming message bubble */}
        <div className="mb-8 flex items-start gap-2">
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "#2A2D38" }}>
            <MessageCircle className="w-4 h-4" style={{ color: "#888" }} />
          </div>
          <div
            className="px-4 py-3 rounded-2xl rounded-tl-md text-[16px] leading-[1.45]"
            style={{ background: BUBBLE_BG, color: "#F5F1E8", maxWidth: "85%" }}
          >
            {SCENARIO.message}
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-4 text-center">
          <p className="text-[13px]" style={{ color: "#888" }}>
            you saw this. what would you actually say?
          </p>
        </div>

        {/* Reply options */}
        <div className="flex flex-col gap-2.5 mb-8">
          {SCENARIO.replies.map((reply, i) => {
            const isTapped = tappedIndex === i;
            const isFlagged = revealed && i === SCENARIO.flaggedIndex;
            const dimmed = tappedIndex !== null && tappedIndex !== i && !isFlagged;
            return (
              <button
                key={i}
                onClick={() => handleTap(i)}
                disabled={tappedIndex !== null}
                className="text-left px-4 py-3.5 rounded-xl flex items-start gap-3 transition-opacity"
                style={{
                  background: isFlagged ? FLAG_TINT : REPLY_BG,
                  border: `1px solid ${isFlagged ? FLAG_BORDER : REPLY_BORDER}`,
                  color: "#F5F1E8",
                  opacity: dimmed ? 0.4 : 1,
                  cursor: tappedIndex === null ? "pointer" : "default",
                }}
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold"
                  style={{
                    background: isFlagged || isTapped ? ACCENT : "#22252F",
                    color: isFlagged || isTapped ? "#08090D" : "#888",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-[15px] leading-[1.4] pt-0.5">{reply.text}</span>
              </button>
            );
          })}
        </div>

        {/* ito's read (reveal) */}
        {revealed && (
          <div
            className="rounded-2xl px-5 py-5 mb-6"
            style={{
              background: "#0E1017",
              border: `1px solid ${REPLY_BORDER}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: ACCENT }}>
                ito's read
              </span>
              <span className="text-[10px]" style={{ color: "#666" }}>·</span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: FLAG_TINT, color: ACCENT, border: `1px solid ${FLAG_BORDER}` }}
              >
                {SCENARIO.signalLabel}
              </span>
            </div>
            <ul className="space-y-2.5 mb-4">
              {SCENARIO.itoRead.map((line, i) => (
                <li key={i} className="text-[15px] leading-[1.5]" style={{ color: "#D5D1C8" }}>
                  {line}
                </li>
              ))}
            </ul>

            <button
              onClick={handleCta}
              className="w-full mt-2 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[15px] font-medium"
              style={{ background: ACCENT, color: "#08090D" }}
            >
              try it with your own situation
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center mt-3" style={{ color: "#666" }}>
              anonymous. no login. takes 60 seconds.
            </p>
          </div>
        )}

        {!revealed && (
          <p className="text-center text-[11px]" style={{ color: "#555" }}>
            tap one to see how ito reads it
          </p>
        )}
      </main>
    </div>
  );
};

export default Misread;
