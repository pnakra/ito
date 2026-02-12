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

interface ExplanationCardProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
}

const ExplanationCard = ({ analysis, isLoading }: ExplanationCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Breaking this down for you...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-6 md:p-8 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Mandatory consent banner */}
      <div className="bg-muted/50 border border-border p-3 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          This is a reflection tool, not a permission slip. Only the other person can give consent.
        </p>
      </div>

      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>
      
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
    </Card>
  );
};

export default ExplanationCard;
