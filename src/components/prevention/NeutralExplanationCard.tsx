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
        <p className="text-muted-foreground text-body">Taking a moment...</p>
      </div>
    );
  }

  if (!analysis) return null;

  if (onComplete) {
    setTimeout(onComplete, 100);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-card shadow-card rounded-lg p-5">
        <p className="text-caption text-muted-foreground text-center">
          The absence of a red flag is not the presence of consent. Only the other person can tell you what they want.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="bg-muted text-muted-foreground py-2.5 px-4 rounded-lg text-body font-medium flex items-center gap-2 shadow-badge">
          <Info className="w-4 h-4" />
          {analysis.signalLabel}
        </div>
      </div>

      {/* Key advice callout */}
      {analysis.suggestion && (
        <div className="bg-callout rounded-lg p-5 text-center">
          <p className="text-[17px] font-semibold text-callout-foreground leading-relaxed">{analysis.suggestion}</p>
        </div>
      )}

      <div className="space-y-3">
        {analysis.why.map((point, i) => (
          <p key={i} className="text-body text-muted-foreground">
            {point}
          </p>
        ))}
      </div>

      <p className="text-body text-muted-foreground text-center italic">
        Consent can change at any time. If they hesitate, go quiet, or pull back, that's your cue to stop.
      </p>
    </div>
  );
};

export default NeutralExplanationCard;
