import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, ArrowRight, ChevronRight, Heart, Repeat } from "lucide-react";

interface ReflectionResult {
  clarityCheck: string;
  otherPersonPerspective: string;
  yourPatterns: string;
  accountabilitySteps: string;
  avoidingRepetition: string;
}

interface AfterExplanationCardProps {
  results: ReflectionResult | null;
  isLoading: boolean;
  onComplete?: () => void;
}

type RevealStep = "clarityCheck" | "perspective" | "patterns" | "accountability" | "forward" | "complete";

const ALL_STEPS: RevealStep[] = ["clarityCheck", "perspective", "patterns", "accountability", "forward", "complete"];

const AfterExplanationCard = ({ results, isLoading, onComplete }: AfterExplanationCardProps) => {
  const [currentStep, setCurrentStep] = useState<RevealStep>("clarityCheck");

  const availableSteps = useMemo(() => {
    if (!results) return ALL_STEPS;
    return ALL_STEPS.filter(step => {
      if (step === "patterns" && !results.yourPatterns?.trim()) return false;
      if (step === "forward" && !results.avoidingRepetition?.trim()) return false;
      return true;
    });
  }, [results]);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Taking a moment to think through this...</p>
      </div>
    );
  }

  if (!results) return null;

  const currentStepIndex = ALL_STEPS.indexOf(currentStep);
  const currentAvailableIndex = availableSteps.indexOf(currentStep);
  const totalVisibleSteps = availableSteps.length - 1;
  const completedSteps = Math.min(currentAvailableIndex, totalVisibleSteps);

  const getNextStep = (from: RevealStep): RevealStep => {
    const fromIndex = ALL_STEPS.indexOf(from);
    for (let i = fromIndex + 1; i < ALL_STEPS.length; i++) {
      const step = ALL_STEPS[i];
      if (step === "patterns" && !results.yourPatterns?.trim()) continue;
      if (step === "forward" && !results.avoidingRepetition?.trim()) continue;
      return step;
    }
    return "complete";
  };

  const handleNext = () => {
    const next = getNextStep(currentStep);
    setCurrentStep(next);
    if (next === "complete" && onComplete) {
      onComplete();
    }
  };

  const isComplete = currentStep === "complete";
  const showNext = !isComplete;

  const getNextLabel = (): string => {
    const next = getNextStep(currentStep);
    switch (next) {
      case "perspective": return "What they might have experienced";
      case "patterns": return "Patterns to notice";
      case "accountability": return "What you can do now";
      case "forward": return "Going forward";
      case "complete": return "Got it";
      default: return "Next";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-center">Here's what came up</h2>

      {!isComplete && (
        <div className="flex justify-center gap-1.5">
          {availableSteps.slice(0, -1).map((step, i) => (
            <div
              key={step}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= completedSteps 
                  ? "w-6 bg-primary" 
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">What might have happened</h3>
        </div>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap ml-6">{results.clarityCheck}</p>
      </div>

      {currentStepIndex >= ALL_STEPS.indexOf("perspective") && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">One way they might have experienced this</h3>
          </div>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap ml-6">{results.otherPersonPerspective}</p>
          <p className="text-xs text-muted-foreground/80 ml-6 border-l-2 border-muted pl-3 mt-2">
            This is based only on what you shared. Only they know how they actually feel.
          </p>
        </div>
      )}

      {currentStepIndex >= ALL_STEPS.indexOf("patterns") && results.yourPatterns?.trim() && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Patterns to notice</h3>
          </div>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap ml-6">{results.yourPatterns}</p>
        </div>
      )}

      {currentStepIndex >= ALL_STEPS.indexOf("accountability") && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">What you can do now</h3>
          </div>
          <div className="bg-muted/20 border border-border/50 rounded-md p-4 ml-6">
            <p className="text-sm whitespace-pre-wrap">{results.accountabilitySteps}</p>
          </div>
        </div>
      )}

      {currentStepIndex >= ALL_STEPS.indexOf("forward") && results.avoidingRepetition?.trim() && (
        <div className="bg-accent/10 border border-accent/20 p-4 rounded-md animate-fade-in">
          <h3 className="font-semibold mb-2 text-sm">Going forward</h3>
          <p className="text-sm whitespace-pre-wrap">{results.avoidingRepetition}</p>
        </div>
      )}

      {showNext && (
        <div className="flex justify-center pt-2">
          <Button 
            onClick={handleNext} 
            className="px-6 active:scale-[0.97]"
          >
            {getNextLabel()} 
            <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {isComplete && (
        <p className="text-sm text-muted-foreground text-center italic">
          Thinking about this doesn't make you a bad person. It means you're trying to do better.
        </p>
      )}
    </div>
  );
};

export default AfterExplanationCard;
