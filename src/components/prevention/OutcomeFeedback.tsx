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
    <div className="text-center space-y-6 py-4 animate-fade-in">
      <p className="text-muted-foreground">{feedback}</p>
      
      <Button
        variant="ghost"
        onClick={onReset}
        className="text-muted-foreground text-sm"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Start over
      </Button>
    </div>
  );
};

export default OutcomeFeedback;
