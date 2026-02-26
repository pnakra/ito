import { useState, useEffect } from "react";
import RiskBadge from "@/components/RiskBadge";
import { AlertTriangle, MessageCircle, ArrowRight as ArrowRightIcon } from "lucide-react";
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
      <div className="space-y-4">
        {analysis.why.map((point, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 transition-opacity duration-200 ${
              i < visibleLines ? "opacity-100 animate-fade-in" : "opacity-0"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">{i + 1}</span>
            </span>
            <p className="text-[15px] text-foreground leading-[1.65]">
              {point}
            </p>
          </div>
        ))}
      </div>

      {/* Callout — appears last */}
      {showCallout && analysis.suggestion && (
        <div className="bg-callout rounded-[12px] px-5 py-4 animate-fade-in flex items-start gap-3">
          <ArrowRightIcon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[15px] font-medium text-foreground leading-relaxed">{analysis.suggestion}</p>
        </div>
      )}

    </div>
  );
};

export default AnimatedExplanationCard;
