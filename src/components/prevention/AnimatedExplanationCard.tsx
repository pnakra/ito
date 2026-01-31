import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, X, Check, MessageCircle, ArrowRight } from "lucide-react";
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

type RevealStep = "assessment" | "whatsHappening" | "whatNotToDo" | "whatToDoInstead" | "realTalk" | "complete";

const STEP_ORDER: RevealStep[] = ["assessment", "whatsHappening", "whatNotToDo", "whatToDoInstead", "realTalk", "complete"];

const AnimatedExplanationCard = ({ analysis, isLoading, onComplete }: AnimatedExplanationCardProps) => {
  const [currentStep, setCurrentStep] = useState<RevealStep>("assessment");

  if (isLoading) {
    return (
      <Card className="p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Breaking this down for you...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  
  // Skip empty sections
  const getNextStep = (from: RevealStep): RevealStep => {
    const fromIndex = STEP_ORDER.indexOf(from);
    for (let i = fromIndex + 1; i < STEP_ORDER.length; i++) {
      const step = STEP_ORDER[i];
      if (step === "whatNotToDo" && analysis.whatNotToDo.length === 0) continue;
      if (step === "whatToDoInstead" && analysis.whatToDoInstead.length === 0) continue;
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

  // Get label for next button
  const getNextLabel = (): string => {
    const next = getNextStep(currentStep);
    switch (next) {
      case "whatsHappening": return "What's going on";
      case "whatNotToDo": return "What not to do";
      case "whatToDoInstead": return "What to try instead";
      case "realTalk": return "The main thing";
      case "complete": return "Got it";
      default: return "Next";
    }
  };

  return (
    <Card className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Always show: Risk Badge + Assessment */}
      <div className="flex justify-center">
        <RiskBadge level={analysis.riskLevel} size="lg" />
      </div>
      
      <p className="text-lg font-medium text-center">{analysis.assessment}</p>

      {/* What's Happening - show if step >= whatsHappening */}
      {currentStepIndex >= STEP_ORDER.indexOf("whatsHappening") && (
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

      {/* What NOT to Do - show if step >= whatNotToDo and has content */}
      {currentStepIndex >= STEP_ORDER.indexOf("whatNotToDo") && analysis.whatNotToDo.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5 text-destructive" />
            <h3 className="font-bold text-lg">Don't do this</h3>
          </div>
          <div className="space-y-2 ml-7">
            {analysis.whatNotToDo.map((point, i) => (
              <div key={i} className="flex gap-2 items-start bg-destructive/10 p-3 rounded-lg">
                <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What to Do Instead - show if step >= whatToDoInstead and has content */}
      {currentStepIndex >= STEP_ORDER.indexOf("whatToDoInstead") && analysis.whatToDoInstead.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <h3 className="font-bold text-lg">Try this instead</h3>
          </div>
          <div className="space-y-2 ml-7">
            {analysis.whatToDoInstead.map((point, i) => (
              <div key={i} className="flex gap-2 items-start bg-success/10 p-3 rounded-lg">
                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Talk - show if step >= realTalk */}
      {currentStepIndex >= STEP_ORDER.indexOf("realTalk") && (
        <div className="bg-accent/20 border border-accent p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-bold">The main thing</h3>
          </div>
          <p>{analysis.realTalk}</p>
        </div>
      )}

      {/* Next button */}
      {showNext && (
        <div className="flex justify-center pt-2">
          <Button onClick={handleNext} className="px-6">
            {getNextLabel()} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AnimatedExplanationCard;
