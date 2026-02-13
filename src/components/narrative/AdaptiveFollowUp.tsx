import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import type { DetectedGap } from "@/lib/narrativeGapDetection";

interface AdaptiveFollowUpProps {
  gaps: DetectedGap[];
  onSubmit: (answers: Record<string, string>) => void;
  onSkip: () => void;
  isLoading: boolean;
}

const AdaptiveFollowUp = ({ gaps, onSubmit, onSkip, isLoading }: AdaptiveFollowUpProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const maxLength = 500;

  const handleChange = (gapId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [gapId]: value.slice(0, maxLength) }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const hasAnyAnswer = Object.values(answers).some(v => v.trim());

  if (isLoading) {
    return (
      <Card className="p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Looking at your situation...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl font-semibold text-center mb-2">
        A couple quick questions
      </h2>
      <p className="text-muted-foreground text-center mb-6 text-sm">
        These help me understand better. Skip any you don't want to answer.
      </p>

      <div className="space-y-5">
        {gaps.map((gap) => (
          <div key={gap.id} className="space-y-2">
            <label className="text-sm font-medium">{gap.question}</label>
            <Textarea
              value={answers[gap.id] || ""}
              onChange={(e) => handleChange(gap.id, e.target.value)}
              placeholder="Optional"
              className="min-h-[60px] resize-none text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          Skip these
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="px-8"
        >
          {hasAnyAnswer ? "Continue" : "Skip"} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default AdaptiveFollowUp;
