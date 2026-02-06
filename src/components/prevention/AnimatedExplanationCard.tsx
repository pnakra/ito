import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, ArrowRight, MessageCircle, ChevronRight } from "lucide-react";
import RiskBadge from "@/components/RiskBadge";
import type { RiskLevel } from "@/types/risk";

interface AnalysisData {
  riskLevel: RiskLevel;
  assessment: string;
  whatsHappening: string[];
  whatNotToDo: string[];
  whatToDoInstead: string[];
  realTalk: string;
}

interface AnimatedExplanationCardProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
  onComplete?: () => void;
}

type RevealStep = "assessment" | "whatsHappening" | "insteadOf" | "realTalk" | "complete";

const ALL_STEPS: RevealStep[] = ["assessment", "whatsHappening", "insteadOf", "realTalk", "complete"];

const AnimatedExplanationCard = ({ analysis, isLoading, onComplete }: AnimatedExplanationCardProps) => {
  const [currentStep, setCurrentStep] = useState<RevealStep>("assessment");

  // Calculate which steps are actually available (skip empty sections)
  const availableSteps = useMemo(() => {
    if (!analysis) return ALL_STEPS;
    return ALL_STEPS.filter(step => {
      // Skip "insteadOf" if both arrays are empty
      if (step === "insteadOf") {
        return analysis.whatNotToDo.length > 0 || analysis.whatToDoInstead.length > 0;
      }
      return true;
    });
  }, [analysis]);

  // Combine "whatNotToDo" and "whatToDoInstead" into "Instead of X, try Y" format
  const insteadOfItems = useMemo(() => {
    if (!analysis) return [];
    const items: { instead: string; tryThis: string }[] = [];
    const maxLen = Math.max(analysis.whatNotToDo.length, analysis.whatToDoInstead.length);
    
    for (let i = 0; i < maxLen; i++) {
      items.push({
        instead: analysis.whatNotToDo[i] || "",
        tryThis: analysis.whatToDoInstead[i] || ""
      });
    }
    return items.filter(item => item.instead || item.tryThis);
  }, [analysis]);

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

  if (!analysis) return null;

  const currentStepIndex = ALL_STEPS.indexOf(currentStep);
  const currentAvailableIndex = availableSteps.indexOf(currentStep);
  const totalVisibleSteps = availableSteps.length - 1;
  const completedSteps = Math.min(currentAvailableIndex, totalVisibleSteps);
  
  const getNextStep = (from: RevealStep): RevealStep => {
    const fromIndex = ALL_STEPS.indexOf(from);
    for (let i = fromIndex + 1; i < ALL_STEPS.length; i++) {
      const step = ALL_STEPS[i];
      if (step === "insteadOf" && analysis.whatNotToDo.length === 0 && analysis.whatToDoInstead.length === 0) continue;
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
      case "whatsHappening": return "What's going on";
      case "insteadOf": return "What to try";
      case "realTalk": return "The main thing";
      case "complete": return "Got it";
      default: return "Next";
    }
  };

  return (
    <Card className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Risk Badge + Assessment - always visible */}
      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>

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
      
      <p className="text-lg font-medium text-center">{analysis.assessment}</p>

      {/* What's Happening */}
      {currentStepIndex >= ALL_STEPS.indexOf("whatsHappening") && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">What's going on</h3>
          </div>
          <ul className="space-y-2 ml-7">
            {analysis.whatsHappening.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instead of X, try Y - combined section */}
      {currentStepIndex >= ALL_STEPS.indexOf("insteadOf") && insteadOfItems.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">What to try</h3>
          </div>
          <div className="space-y-3 ml-2">
            {insteadOfItems.map((item, i) => (
              <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
                {item.instead && (
                  <div className="bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                    Instead of: {item.instead}
                  </div>
                )}
                {item.tryThis && (
                  <div className="bg-success/5 px-4 py-3 text-foreground">
                    <span className="text-success font-medium">Try:</span> {item.tryThis}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Talk */}
      {currentStepIndex >= ALL_STEPS.indexOf("realTalk") && (
        <div className="bg-accent/20 border border-accent p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-bold">The main thing</h3>
          </div>
          <p>{analysis.realTalk}</p>
        </div>
      )}

      {/* Next button - more visually distinct */}
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
        <p className="text-xs text-muted-foreground text-center">
          Only the other person can give consent.
        </p>
      )}
    </Card>
  );
};

export default AnimatedExplanationCard;
