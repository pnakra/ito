import { Card } from "@/components/ui/card";
import { Loader2, Eye, X, Check, MessageCircle } from "lucide-react";
import RiskBadge from "@/components/RiskBadge";
import type { RiskLevel } from "@/data/scenarios";

interface AnalysisData {
  riskLevel: RiskLevel;
  assessment: string;
  whatsHappening: string[];
  whatNotToDo: string[];
  whatToDoInstead: string[];
  realTalk: string;
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
    <Card className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>
      
      <p className="text-lg font-medium text-center">{analysis.assessment}</p>

      {/* What's Happening */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">What's Actually Happening</h3>
        </div>
        <ul className="space-y-2 ml-7">
          {analysis.whatsHappening.map((point, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What NOT to Do */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <X className="w-5 h-5 text-destructive" />
          <h3 className="font-bold text-lg">What NOT to Do</h3>
        </div>
        <div className="space-y-2 ml-7">
          {analysis.whatNotToDo.map((point, i) => (
            <div key={i} className="flex gap-2 items-start bg-destructive/10 p-3 rounded-lg">
              <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What to Do Instead */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-success" />
          <h3 className="font-bold text-lg">What to Do Instead</h3>
        </div>
        <div className="space-y-2 ml-7">
          {analysis.whatToDoInstead.map((point, i) => (
            <div key={i} className="flex gap-2 items-start bg-success/10 p-3 rounded-lg">
              <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Real Talk */}
      <div className="bg-accent/20 border border-accent p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-bold">Real Talk</h3>
        </div>
        <p>{analysis.realTalk}</p>
      </div>
    </Card>
  );
};

export default ExplanationCard;
