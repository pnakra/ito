import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, ArrowRight, MessageCircle, ChevronRight, Heart, Repeat } from "lucide-react";

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

  // Calculate which steps are available (skip empty sections)
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
      <Card className="p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Taking a moment to think through this...</p>
        </div>
      </Card>
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
    <Card className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <h2 className="text-xl font-semibold text-center">Here's what came up</h2>

      {/* Progress dots */}
      {!isComplete && (
        <div className="flex justify-center gap-1.5">
          {availableSteps.slice(0, -1).map((step, i) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= completedSteps 
                  ? "w-6 bg-primary" 
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Clarity Check - always visible */}
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">What might have happened</h3>
        </div>
        <p className="text-muted-foreground whitespace-pre-wrap ml-7">{results.clarityCheck}</p>
      </div>

      {/* Other Person's Perspective */}
      {currentStepIndex >= ALL_STEPS.indexOf("perspective") && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">What might they have experienced?</h3>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap ml-7">{results.otherPersonPerspective}</p>
          <p className="text-[10px] text-muted-foreground/60 ml-7">
            Based on what you shared. This is not a substitute for hearing from them directly.
          </p>
        </div>
      )}

      {/* Your Patterns */}
      {currentStepIndex >= ALL_STEPS.indexOf("patterns") && results.yourPatterns?.trim() && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Patterns to notice</h3>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap ml-7">{results.yourPatterns}</p>
        </div>
      )}

      {/* Accountability Steps */}
      {currentStepIndex >= ALL_STEPS.indexOf("accountability") && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">What you can do now</h3>
          </div>
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4 ml-7">
            <p className="whitespace-pre-wrap">{results.accountabilitySteps}</p>
          </div>
        </div>
      )}

      {/* Going Forward */}
      {currentStepIndex >= ALL_STEPS.indexOf("forward") && results.avoidingRepetition?.trim() && (
        <div className="bg-accent/20 border border-accent p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-bold">Going forward</h3>
          </div>
          <p className="whitespace-pre-wrap">{results.avoidingRepetition}</p>
        </div>
      )}

      {/* Next button */}
      {showNext && (
        <div className="flex justify-center pt-2">
          <Button 
            onClick={handleNext} 
            className="px-6 gap-2"
            size="lg"
          >
            {getNextLabel()} 
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Subtle reminder at completion */}
      {isComplete && (
        <p className="text-sm text-muted-foreground text-center italic">
          Thinking about this doesn't make you a bad person. It means you're trying to do better.
        </p>
      )}
    </Card>
  );
};

export default AfterExplanationCard;
