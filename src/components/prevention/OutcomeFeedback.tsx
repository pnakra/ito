import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface OutcomeFeedbackProps {
  outcomeId: string;
  onReset: () => void;
}

const feedbackMap: Record<string, string> = {
  stopped: "Clear pauses and verbal check-ins are what actually prevent harm.",
  "checked-in": "Clear pauses and verbal check-ins are what actually prevent harm.",
  "didnt-proceed": "Choosing not to proceed is always a valid way to keep things safe.",
  "not-sure": "If a situation feels confusing, earlier pauses usually make things clearer.",
};

const OutcomeFeedback = ({ outcomeId, onReset }: OutcomeFeedbackProps) => {
  const feedback = feedbackMap[outcomeId] || feedbackMap["not-sure"];

  return (
    <Card className="p-6 md:p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      <p className="text-muted-foreground text-lg mb-6">{feedback}</p>
      
      <Button
        variant="ghost"
        onClick={onReset}
        className="text-muted-foreground"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Start over
      </Button>
    </Card>
  );
};

export default OutcomeFeedback;
