import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Check } from "lucide-react";
import type { DetectedGap } from "@/lib/narrativeGapDetection";

interface AdaptiveFollowUpProps {
  gaps: DetectedGap[];
  onSubmit: (answers: Record<string, string>) => void;
  onSkip: () => void;
  isLoading: boolean;
}

const TIMING_CHOICES = [
  { value: "already-happened", label: "It already happened" },
  { value: "still-deciding", label: "Still deciding what to do" },
  { value: "mixed", label: "Something happened and something might" },
  { value: "not-sure", label: "Not sure" },
];

const AdaptiveFollowUp = ({ gaps, onSubmit, onSkip, isLoading }: AdaptiveFollowUpProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const maxLength = 500;

  const handleChange = (gapId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [gapId]: value.slice(0, maxLength) }));
  };

  const handleSelect = (gapId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [gapId]: prev[gapId] === value ? "" : value,
    }));
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
        <p className="text-muted-foreground text-body">Thinking...</p>
      </div>
    );
  }

  const currentGap = gaps[currentIndex];
  if (!currentGap) return null;

  const isTimingGap = currentGap.id === "timing-clarification";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-5">
        <label className="text-h2 block">{currentGap.question}</label>

        {isTimingGap ? (
          <div className="flex flex-col gap-2.5">
            {TIMING_CHOICES.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(currentGap.id, opt.value)}
                disabled={isLoading}
                className={`text-left px-4 h-[56px] rounded-[12px] text-[14px] transition-all duration-150 active:scale-[0.98] ${
                  answers[currentGap.id] === opt.value
                    ? "bg-accent border-[1.5px] border-primary text-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {answers[currentGap.id] === opt.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <Textarea
            value={answers[currentGap.id] || ""}
            onChange={(e) => handleChange(currentGap.id, e.target.value)}
            placeholder="Optional"
            className="min-h-[80px] resize-none text-body"
          />
        )}
      </div>

      <div className="space-y-3 pt-2">
        <Button
          onClick={handleNext}
          className="w-full"
        >
          {hasCurrentAnswer ? "Next" : "Skip"} <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
        <button
          onClick={onSkip}
          className="block mx-auto text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip all
        </button>
      </div>
    </div>
  );
};

export default AdaptiveFollowUp;
