import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Looking at your situation...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">
          A couple quick questions
        </h2>
        <p className="text-muted-foreground text-sm">
          These help me understand better. Skip any you don't want to answer.
        </p>
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => (
          <div key={gap.id} className="space-y-1.5">
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

      <div className="flex justify-between items-center pt-1">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-muted-foreground text-sm"
        >
          Skip
        </Button>
        <Button
          onClick={handleSubmit}
          className="px-6 active:scale-[0.97]"
        >
          {hasAnyAnswer ? "Continue" : "Skip"} <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default AdaptiveFollowUp;
