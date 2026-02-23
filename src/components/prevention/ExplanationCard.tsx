import { Loader2 } from "lucide-react";
import RiskBadge from "@/components/RiskBadge";
import type { RiskLevel } from "@/types/risk";

interface AnalysisData {
  riskLevel: RiskLevel;
  signalLabel: string;
  why: string[];
  suggestion: string;
}

interface ExplanationCardProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
}

const ExplanationCard = ({ analysis, isLoading }: ExplanationCardProps) => {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-body">Breaking this down for you...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-card shadow-card p-5 rounded-lg">
        <p className="text-caption text-muted-foreground text-center">
          This is a reflection tool, not a permission slip. Only the other person can give consent.
        </p>
      </div>

      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>
      
      <p className="text-h2 text-center">{analysis.signalLabel}</p>

      {analysis.suggestion && (
        <div className="bg-callout rounded-lg p-5 text-center">
          <p className="text-[17px] font-semibold text-callout-foreground leading-relaxed">{analysis.suggestion}</p>
        </div>
      )}

      <div className="space-y-3">
        {analysis.why.map((point, i) => (
          <p key={i} className="text-body">
            {point}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ExplanationCard;
