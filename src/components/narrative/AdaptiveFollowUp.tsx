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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const maxLength = 500;

  const handleChange = (gapId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [gapId]: value.slice(0, maxLength) }));
  };

  const handleNext = () => {
    if (currentIndex < gaps.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onSubmit(answers);
    }
  };

  const hasCurrentAnswer = (answers[gaps[currentIndex]?.id] || "").trim();

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-body">Looking at your situation...</p>
      </div>
    );
  }

  const currentGap = gaps[currentIndex];
  if (!currentGap) return null;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {gaps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? "bg-primary" : i < currentIndex ? "bg-primary/40" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="space-y-8">
        <label className="text-h2 block">{currentGap.question}</label>
        <Textarea
          value={answers[currentGap.id] || ""}
          onChange={(e) => handleChange(currentGap.id, e.target.value)}
          placeholder="Optional"
          className="min-h-[80px] resize-none text-body"
        />
      </div>

      <div className="space-y-3 pt-2">
        <Button
          onClick={handleNext}
          className="w-full"
        >
          {hasCurrentAnswer ? "Next" : "Skip"} <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
        {hasCurrentAnswer && (
          <button
            onClick={onSkip}
            className="block mx-auto text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip all
          </button>
        )}
      </div>
    </div>
  );
};

export default AdaptiveFollowUp;
