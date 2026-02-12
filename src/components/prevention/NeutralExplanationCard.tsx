import { Card } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";

interface NeutralAnalysisData {
  signalLabel: string;
  why: string[];
  suggestion: string;
}

interface NeutralExplanationCardProps {
  analysis: NeutralAnalysisData | null;
  isLoading: boolean;
}

const NeutralExplanationCard = ({ analysis, isLoading }: NeutralExplanationCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-8 animate-in fade-in duration-300 border-border/50">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Taking a moment...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-6 md:p-8 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 border-border/50">
      {/* Mandatory consent banner */}
      <div className="bg-muted/50 border border-border p-3 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          The absence of a red flag is not the presence of consent. Only the other person can tell you what they want.
        </p>
      </div>

      {/* Neutral header */}
      <div className="flex justify-center">
        <div className="bg-muted text-muted-foreground py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
          <Info className="w-4 h-4" />
          {analysis.signalLabel}
        </div>
      </div>

      {/* Why bullets */}
      <div className="space-y-2">
        {analysis.why.map((point, i) => (
          <p key={i} className="text-sm text-muted-foreground flex gap-2">
            <span>•</span>
            <span>{point}</span>
          </p>
        ))}
      </div>

      {/* The one suggestion */}
      {analysis.suggestion && (
        <div className="bg-muted/50 border border-border/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">{analysis.suggestion}</p>
        </div>
      )}

      {/* Consent reminder */}
      <p className="text-sm text-muted-foreground text-center italic">
        Consent can change at any time. If they hesitate, go quiet, or pull back, that's your cue to stop.
      </p>
    </Card>
  );
};

export default NeutralExplanationCard;
