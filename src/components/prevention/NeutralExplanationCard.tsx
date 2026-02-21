import { Loader2, Info } from "lucide-react";

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
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Taking a moment...</p>
      </div>
    );
  }

  if (!analysis) return null;

  if (onComplete) {
    setTimeout(onComplete, 100);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-muted/30 border border-border/50 p-3 rounded-md">
        <p className="text-xs text-muted-foreground text-center">
          The absence of a red flag is not the presence of consent. Only the other person can tell you what they want.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="bg-muted text-muted-foreground py-2 px-3.5 rounded-md text-sm font-medium flex items-center gap-2">
          <Info className="w-4 h-4" />
          {analysis.signalLabel}
        </div>
      </div>

      <div className="space-y-2">
        {analysis.why.map((point, i) => (
          <p key={i} className="text-sm text-muted-foreground flex gap-2">
            <span>•</span>
            <span>{point}</span>
          </p>
        ))}
      </div>

      {analysis.suggestion && (
        <div className="bg-muted/30 border border-border/50 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">{analysis.suggestion}</p>
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center italic">
        Consent can change at any time. If they hesitate, go quiet, or pull back, that's your cue to stop.
      </p>
    </div>
  );
};

export default NeutralExplanationCard;
