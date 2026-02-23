import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface OutcomeFeedbackProps {
  outcomeId: string;
  onReset: () => void;
}

const feedbackMap: Record<string, string> = {
  stopped: "Stopping or asking is how you make sure everyone's okay.",
  "checked-in": "Stopping or asking is how you make sure everyone's okay.",
  "didnt-proceed": "Not going through with it is always an okay choice.",
  "not-sure": "When things feel confusing, it usually helps to slow down sooner.",
};

const OutcomeFeedback = ({ outcomeId, onReset }: OutcomeFeedbackProps) => {
  const feedback = feedbackMap[outcomeId] || feedbackMap["not-sure"];

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
