import { useState, useEffect } from "react";
import RiskBadge from "@/components/RiskBadge";
import type { RiskLevel } from "@/types/risk";

interface AnalysisData {
  riskLevel: RiskLevel;
  signalLabel: string;
  why: string[];
  suggestion: string;
}

interface AnimatedExplanationCardProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
  onComplete?: () => void;
}

const AnimatedExplanationCard = ({ analysis, isLoading, onComplete }: AnimatedExplanationCardProps) => {
  const [showBadge, setShowBadge] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCallout, setShowCallout] = useState(false);

  useEffect(() => {
    if (!analysis || isLoading) return;

    // Badge after 200ms
    const t1 = setTimeout(() => setShowBadge(true), 200);
    // Lines staggered
    const lineTimers = analysis.why.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 550 + i * 150)
    );
    // Callout last
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
      {/* Badge hero */}
      {showBadge && (
        <div className="flex justify-center animate-scale-in" style={{ animationDuration: "350ms", animationDelay: "0ms" }}>
          <RiskBadge level={analysis.riskLevel} size="lg" />
        </div>
      )}

      {/* Why lines — staggered fade */}
      <div className="space-y-2.5">
        {analysis.why.map((point, i) => (
          <p
            key={i}
            className={`text-[15px] text-[#3a3a3a] leading-[1.7] transition-opacity duration-200 ${
              i < visibleLines ? "opacity-100 animate-fade-in" : "opacity-0"
            }`}
          >
            {point}
          </p>
        ))}
      </div>

      {/* Callout — appears last */}
      {showCallout && analysis.suggestion && (
        <div className="bg-callout rounded-[12px] px-5 py-4 animate-fade-in">
          <p className="text-[15px] font-medium italic text-foreground leading-relaxed">{analysis.suggestion}</p>
        </div>
      )}

      <p className="text-[13px] text-muted-foreground text-center">
        Only the other person can give consent.
      </p>
    </div>
  );
};

export default AnimatedExplanationCard;
