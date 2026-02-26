import { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface NeutralAnalysisData {
  signalLabel: string;
  why: string[];
  suggestion: string;
}

interface NeutralExplanationCardProps {
  analysis: NeutralAnalysisData | null;
  isLoading: boolean;
  onComplete?: () => void;
}

const NeutralExplanationCard = ({ analysis, isLoading, onComplete }: NeutralExplanationCardProps) => {
  const [showBadge, setShowBadge] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCallout, setShowCallout] = useState(false);

  useEffect(() => {
    if (!analysis || isLoading) return;

    const t1 = setTimeout(() => setShowBadge(true), 200);
    const lineTimers = analysis.why.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 550 + i * 150)
    );
    const t2 = setTimeout(() => {
      setShowCallout(true);
      onComplete?.();
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      lineTimers.forEach(clearTimeout);
    };
  }, [analysis, isLoading]);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center animate-fade-in">
        <div className="flex gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="bg-card shadow-card rounded-[16px] p-5">
        <p className="text-[13px] text-muted-foreground text-center">
          The absence of a red flag is not the presence of consent. Only the other person can tell you what they want.
        </p>
      </div>

      {showBadge && (
        <div className="flex justify-center animate-scale-in" style={{ animationDuration: "350ms" }}>
          <div className="bg-muted text-muted-foreground border-[1.5px] border-border rounded-full py-2 px-5 font-semibold text-[16px] tracking-[-0.2px] inline-flex items-center gap-2 shadow-badge leading-none">
            <Info className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{analysis.signalLabel}</span>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {analysis.why.map((point, i) => (
          <p
            key={i}
            className={`text-[15px] text-muted-foreground leading-[1.7] transition-opacity duration-200 ${
              i < visibleLines ? "opacity-100 animate-fade-in" : "opacity-0"
            }`}
          >
            {point}
          </p>
        ))}
      </div>

      {showCallout && analysis.suggestion && (
        <div className="bg-callout rounded-[12px] px-5 py-4 animate-fade-in">
          <p className="text-[15px] font-medium italic text-foreground leading-relaxed">{analysis.suggestion}</p>
        </div>
      )}

      <p className="text-[15px] text-muted-foreground text-center italic">
        Consent can change at any time. If they hesitate, go quiet, or pull back, that's your cue to stop.
      </p>
    </div>
  );
};

export default NeutralExplanationCard;
