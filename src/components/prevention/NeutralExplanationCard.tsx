import { Card } from "@/components/ui/card";
import { Loader2, Info, MessageCircle } from "lucide-react";

interface NeutralAnalysisData {
  assessment: string;
  whatsHappening: string[];
  realTalk: string;
}

interface NeutralExplanationCardProps {
  analysis: NeutralAnalysisData | null;
  isLoading: boolean;
}

const NeutralExplanationCard = ({ analysis, isLoading }: NeutralExplanationCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking this through...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Neutral header - no green, no approval */}
      <div className="flex justify-center">
        <div className="bg-muted text-muted-foreground py-3 px-5 rounded-lg font-medium flex items-center justify-center gap-2">
          <Info className="w-5 h-5" />
          Nothing jumped out as a problem
        </div>
      </div>
      
      {/* Core message - deliberately minimal */}
      <p className="text-lg text-center text-muted-foreground">{analysis.assessment}</p>

      {/* Key points - brief */}
      <div className="space-y-2">
        {analysis.whatsHappening.slice(0, 2).map((point, i) => (
          <p key={i} className="text-sm text-muted-foreground flex gap-2">
            <span>•</span>
            <span>{point}</span>
          </p>
        ))}
      </div>

      {/* Consent reminder - always present */}
      <div className="bg-muted/50 border border-border p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Keep in mind</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This doesn't mean "go ahead." It just means nothing obvious came up.
          People can change their mind at any time. If they pull back, go quiet, or seem unsure — stop.
        </p>
      </div>

      {/* Self-interest angle - brief */}
      <p className="text-sm text-muted-foreground text-center italic">
        {analysis.realTalk}
      </p>
    </Card>
  );
};

export default NeutralExplanationCard;
