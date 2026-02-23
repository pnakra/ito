import { Loader2 } from "lucide-react";
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
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-body">Looking at your situation...</p>
      </div>
    );
  }

  if (!analysis) return null;

  if (onComplete) {
    setTimeout(onComplete, 100);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>

      {/* Key advice callout */}
      {analysis.suggestion && (
        <div className="bg-callout rounded-lg p-5 text-center">
          <p className="text-[17px] font-semibold text-callout-foreground leading-relaxed">{analysis.suggestion}</p>
        </div>
      )}

      <div className="space-y-3">
        {analysis.why.map((point, i) => (
          <p key={i} className="text-body text-foreground">
            {point}
          </p>
        ))}
      </div>

      <p className="text-caption text-muted-foreground text-center">
        Only the other person can give consent.
      </p>
    </div>
  );
};

export default AnimatedExplanationCard;
