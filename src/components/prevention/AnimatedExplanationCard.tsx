import { Card } from "@/components/ui/card";
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
      <Card className="p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Looking at your situation...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  // Auto-complete since there's no multi-step reveal anymore
  if (onComplete) {
    setTimeout(onComplete, 100);
  }

  return (
    <Card className="p-6 md:p-8 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Risk Badge */}
      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>

      {/* Signal Label */}
      <p className="text-lg font-bold text-center">{analysis.signalLabel}</p>

      {/* Why bullets */}
      <div className="space-y-2">
        {analysis.why.map((point, i) => (
          <p key={i} className="text-sm flex gap-2">
            <span className="text-muted-foreground">•</span>
            <span>{point}</span>
          </p>
        ))}
      </div>

      {/* The one suggestion */}
      {analysis.suggestion && (
        <div className="bg-accent/20 border border-accent p-4 rounded-lg">
          <p className="text-sm font-medium">{analysis.suggestion}</p>
        </div>
      )}

      {/* Consent reminder */}
      <p className="text-xs text-muted-foreground text-center">
        Only the other person can give consent.
      </p>
    </Card>
  );
};

export default AnimatedExplanationCard;
