import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface OutcomeFeedbackProps {
  outcomeId: string;
  /** Optional display override — the logged value stays `outcomeId`. */
  feedbackKey?: string;
  onReset: () => void;
}

export const feedbackMap: Record<string, string> = {
  stopped: "Stopping or asking is how you make sure everyone's okay.",
  "checked-in": "Stopping or asking is how you make sure everyone's okay.",
  "didnt-proceed": "Not going through with it is always an okay choice.",
  "not-sure": "When things feel confusing, it usually helps to slow down sooner.",
  "stepped-in": "Stepping in is hard. If you are still worried about them, checking in later helps too.",
  "checked-on-them": "Letting them lead is the right way to do it. RAINN is at 1-800-656-4673 if they want options.",
  "told-someone": "Telling someone who can act matters. Write down what you saw while it is fresh.",
  "saved-messages": "Keep it private and backed up. It keeps their options open.",
  "not-yet": "It is not too late to check on them, or to talk it through with RAINN at 1-800-656-4673.",
"prefer-not-to-say": "That's fine. When things feel unclear, slowing down is usually the move.",
  "witness-prefer-not-to-say": "That's fine. It is not too late to check on them, or to talk it through with RAINN at 1-800-656-4673.",
};


const OutcomeFeedback = ({ outcomeId, feedbackKey, onReset }: OutcomeFeedbackProps) => {
  const feedback = feedbackMap[feedbackKey ?? outcomeId] || feedbackMap["not-sure"];

  return (
    <div className="text-center space-y-6 py-6 animate-fade-in">
      <div className="bg-callout rounded-lg p-5">
        <p className="text-[17px] font-semibold text-callout-foreground">{feedback}</p>
      </div>
      
      <Button
        variant="ghost"
        onClick={onReset}
        className="text-muted-foreground text-caption"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Start over
      </Button>
    </div>
  );
};

export default OutcomeFeedback;
