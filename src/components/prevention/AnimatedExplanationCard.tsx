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
        <p className="text-muted-foreground text-sm">Looking at your situation...</p>
      </div>
    );
  }

  if (!analysis) return null;

  if (onComplete) {
    setTimeout(onComplete, 100);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>

      <p className="text-base font-semibold text-center">{analysis.signalLabel}</p>

      <div className="space-y-2">
        {analysis.why.map((point, i) => (
          <p key={i} className="text-sm flex gap-2">
            <span className="text-muted-foreground">•</span>
            <span>{point}</span>
          </p>
        ))}
      </div>

      {analysis.suggestion && (
        <div className="bg-accent/20 border border-accent/30 p-4 rounded-md">
          <p className="text-sm">{analysis.suggestion}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Only the other person can give consent.
      </p>
    </div>
  );
};

export default AnimatedExplanationCard;
