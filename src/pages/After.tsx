import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

import AfterDecisionStep, { type AfterStepOption } from "@/components/after/AfterDecisionStep";
import AfterContextInput from "@/components/after/AfterContextInput";
import AfterExplanationCard from "@/components/after/AfterExplanationCard";
import AfterFollowUpChat from "@/components/after/AfterFollowUpChat";
import { supabase } from "@/integrations/supabase/client";
import { logChoice, logFreetext, logAIResponse, resetSessionId } from "@/lib/submissionLogger";
import { ArrowRight, RotateCcw, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FlowPhase = 
  | "intro"
  | "situation"
  | "what-happened"
  | "their-response"
  | "current-feelings"
  | "additional-context"
  | "results"
  | "follow-up-chat"
  | "complete";

interface ReflectionResult {
  clarityCheck: string;
  otherPersonPerspective: string;
  yourPatterns: string;
  accountabilitySteps: string;
  avoidingRepetition: string;
}

interface FollowUpMessage {
  role: "user" | "assistant";
  content: string;
}

interface DecisionState {
  situation: string | null;
  whatHappened: string | null;
  theirResponse: string | null;
  currentFeelings: string | null;
  additionalContext: string;
}

// Step 1: Situation options
const situationOptions: AfterStepOption[] = [
  { id: "hookup", label: "We hooked up or were physical" },
  { id: "conversation", label: "Something was said" },
  { id: "ongoing", label: "It's been happening over time" },
  { id: "digital", label: "It happened online or over text" },
  { id: "not-sure", label: "I'm not sure how to describe it" }
];

// Step 2: What happened options
const whatHappenedOptions: AfterStepOption[] = [
  { id: "went-further", label: "Things went further than they wanted", description: "Physically or emotionally" },
  { id: "ignored-signals", label: "I didn't notice or ignored their signals", description: "They went quiet, pulled away, or seemed off" },
  { id: "pressure", label: "I kept asking or pushing", description: "Until they went along with it" },
  { id: "intoxicated", label: "They were drunk or high", description: "And might not have been able to fully consent" },
  { id: "power-dynamic", label: "There was a power difference", description: "Age, position, experience, etc." },
  { id: "other", label: "Something else", description: "I'll explain more in a moment" }
];

// Step 3: Their response options
const theirResponseOptions: AfterStepOption[] = [
  { id: "told-me", label: "They told me I hurt them" },
  { id: "distant", label: "They've been distant or avoiding me" },
  { id: "no-contact", label: "They stopped talking to me" },
  { id: "acting-different", label: "They're acting differently around me" },
  { id: "havent-said", label: "They haven't said anything, but I'm worried" },
  { id: "someone-else", label: "Someone else told me there's a problem" }
];

// Step 4: Current feelings options
const currentFeelingsOptions: AfterStepOption[] = [
  { id: "worried", label: "I'm worried I hurt them" },
  { id: "confused", label: "I'm confused about what happened" },
  { id: "defensive", label: "I feel defensive but want to understand" },
  { id: "guilty", label: "I feel guilty" },
  { id: "want-to-fix", label: "I want to make it right" },
  { id: "need-clarity", label: "I just need to understand what I did" }
];

const After = () => {
  const [phase, setPhase] = useState<FlowPhase>("intro");
  const [phaseHistory, setPhaseHistory] = useState<FlowPhase[]>([]);
  const [decisions, setDecisions] = useState<DecisionState>({
    situation: null,
    whatHappened: null,
    theirResponse: null,
    currentFeelings: null,
    additionalContext: ""
  });
  const [results, setResults] = useState<ReflectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanationComplete, setExplanationComplete] = useState(false);
  const [followUpMessages, setFollowUpMessages] = useState<FollowUpMessage[]>([]);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  
  const { toast } = useToast();

  // Navigate forward with history
  const goToPhase = (nextPhase: FlowPhase) => {
    setPhaseHistory(prev => [...prev, phase]);
    setPhase(nextPhase);
  };

  // Navigate back
  const handleBack = () => {
    if (phaseHistory.length > 0) {
      const newHistory = [...phaseHistory];
      const previousPhase = newHistory.pop()!;
      setPhaseHistory(newHistory);
      setPhase(previousPhase);
    }
  };

  const isInQuestionFlow = ["situation", "what-happened", "their-response", "current-feelings", "additional-context"].includes(phase);

  // Selection handlers
  const handleSituationSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, situation: id }));
    logChoice("after-crossed", "situation", id);
  };

  const handleWhatHappenedSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, whatHappened: id }));
    logChoice("after-crossed", "what-happened", id);
  };

  const handleTheirResponseSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, theirResponse: id }));
    logChoice("after-crossed", "their-response", id);
  };

  const handleCurrentFeelingsSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, currentFeelings: id }));
    logChoice("after-crossed", "current-feelings", id);
  };

  const proceedToNextStep = () => {
    if (phase === "situation" && decisions.situation) {
      goToPhase("what-happened");
    } else if (phase === "what-happened" && decisions.whatHappened) {
      goToPhase("their-response");
    } else if (phase === "their-response" && decisions.theirResponse) {
      goToPhase("current-feelings");
    } else if (phase === "current-feelings" && decisions.currentFeelings) {
      goToPhase("additional-context");
    }
  };

  const formatSelectionsForAI = (): string => {
    const parts: string[] = [];

    // Situation
    const situationLabel = situationOptions.find(o => o.id === decisions.situation)?.label;
    if (situationLabel) parts.push(`Situation: ${situationLabel}`);

    // What happened
    const whatHappenedOption = whatHappenedOptions.find(o => o.id === decisions.whatHappened);
    if (whatHappenedOption) {
      parts.push(`What happened: ${whatHappenedOption.label}${whatHappenedOption.description ? ` (${whatHappenedOption.description})` : ''}`);
    }

    // Their response
    const theirResponseLabel = theirResponseOptions.find(o => o.id === decisions.theirResponse)?.label;
    if (theirResponseLabel) parts.push(`Their response: ${theirResponseLabel}`);

    // Current feelings
    const currentFeelingsLabel = currentFeelingsOptions.find(o => o.id === decisions.currentFeelings)?.label;
    if (currentFeelingsLabel) parts.push(`How I'm feeling: ${currentFeelingsLabel}`);

    // Additional context
    if (decisions.additionalContext.trim()) {
      parts.push(`Additional context: ${decisions.additionalContext}`);
    }

    return parts.join("\n\n");
  };

  const handleContextInputContinue = async () => {
    if (decisions.additionalContext.trim()) {
      logFreetext("after-crossed", "additional-context", decisions.additionalContext);
    }

    setIsLoading(true);
    goToPhase("results");

    try {
      const scenario = formatSelectionsForAI();
      
      const { data, error } = await supabase.functions.invoke("analyze-crossed-line", {
        body: { scenario }
      });

      if (error) throw error;

      setResults(data as ReflectionResult);
      logAIResponse("after-crossed", "reflection", data.clarityCheck?.slice(0, 100) || "Reflection generated");
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      // Set fallback results
      setResults({
        clarityCheck: "We're having trouble processing this right now.",
        otherPersonPerspective: "Please try again in a moment.",
        yourPatterns: "",
        accountabilitySteps: "If this continues, please seek support from a trusted adult.",
        avoidingRepetition: ""
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplanationComplete = () => {
    setExplanationComplete(true);
  };

  const handleFollowUpSubmit = async (message: string) => {
    const userMessage: FollowUpMessage = { role: "user", content: message };
    setFollowUpMessages(prev => [...prev, userMessage]);
    setIsFollowUpLoading(true);
    
    logFreetext("after-crossed", "follow-up", message);

    try {
      const followUpResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crossed-line-followup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            message,
            conversationHistory: followUpMessages,
            originalReflection: results,
          }),
        }
      );

      if (!followUpResponse.ok) {
        throw new Error(`HTTP ${followUpResponse.status}`);
      }

      const followUpData = await followUpResponse.json();
      const assistantMessage: FollowUpMessage = {
        role: "assistant",
        content: followUpData.response,
      };
      setFollowUpMessages(prev => [...prev, assistantMessage]);
      logAIResponse("after-crossed", "follow-up-response", followUpData.response || "Follow-up response");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage: FollowUpMessage = {
        role: "assistant",
        content: "I'm having trouble right now. Please try again."
      };
      setFollowUpMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleFollowUpDone = () => {
    goToPhase("complete");
  };

  const handleStartFollowUp = () => {
    setFollowUpMessages([]);
    goToPhase("follow-up-chat");
  };

  const resetFlow = () => {
    setPhase("intro");
    setPhaseHistory([]);
    setDecisions({
      situation: null,
      whatHappened: null,
      theirResponse: null,
      currentFeelings: null,
      additionalContext: ""
    });
    setResults(null);
    setIsLoading(false);
    setExplanationComplete(false);
    setFollowUpMessages([]);
    resetSessionId();
  };

  const canProceed = useCallback(() => {
    if (phase === "situation") return !!decisions.situation;
    if (phase === "what-happened") return !!decisions.whatHappened;
    if (phase === "their-response") return !!decisions.theirResponse;
    if (phase === "current-feelings") return !!decisions.currentFeelings;
    return false;
  }, [phase, decisions]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {isInQuestionFlow ? (
            <BackButton label="Back" onClick={handleBack} />
          ) : (
            <BackButton to="/" />
          )}

          {/* Intro */}
          {phase === "intro" && (
            <div className="space-y-5 animate-fade-in">
              <h1 className="text-xl sm:text-2xl font-semibold">
                Let's think through what happened.
              </h1>

              <p className="text-muted-foreground text-sm">
                Sometimes you look back and realize something felt off, or you're worried you went too far. 
                This is a space to slow down and figure it out.
              </p>

              <p className="text-xs text-muted-foreground border border-border/50 rounded-md p-3">
                We'll ask a few questions first, then help you think it through.
              </p>

              <div className="pt-2">
                <Button 
                  onClick={() => goToPhase("situation")} 
                  className="px-6 active:scale-[0.97]"
                >
                  Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Situation */}
          <AfterDecisionStep
            stepNumber={1}
            title="What's the situation?"
            options={situationOptions}
            selectedValues={decisions.situation ? [decisions.situation] : []}
            onSelect={handleSituationSelect}
            isActive={phase === "situation"}
          />

          {/* Step 2: What happened */}
          <AfterDecisionStep
            stepNumber={2}
            title="What are you worried about?"
            options={whatHappenedOptions}
            selectedValues={decisions.whatHappened ? [decisions.whatHappened] : []}
            onSelect={handleWhatHappenedSelect}
            isActive={phase === "what-happened"}
          />

          {/* Step 3: Their response */}
          <AfterDecisionStep
            stepNumber={3}
            title="How are they acting now?"
            options={theirResponseOptions}
            selectedValues={decisions.theirResponse ? [decisions.theirResponse] : []}
            onSelect={handleTheirResponseSelect}
            isActive={phase === "their-response"}
          />

          {/* Step 4: Current feelings */}
          <AfterDecisionStep
            stepNumber={4}
            title="How are you feeling about it?"
            options={currentFeelingsOptions}
            selectedValues={decisions.currentFeelings ? [decisions.currentFeelings] : []}
            onSelect={handleCurrentFeelingsSelect}
            isActive={phase === "current-feelings"}
          />

          {/* Step 5: Additional context */}
          <AfterContextInput
            value={decisions.additionalContext}
            onChange={(value) => setDecisions(prev => ({ ...prev, additionalContext: value }))}
            onContinue={handleContextInputContinue}
            isActive={phase === "additional-context"}
            isLoading={isLoading}
          />

          {/* Continue button for steps 1-4 */}
          {(phase === "situation" || phase === "what-happened" || phase === "their-response" || phase === "current-feelings") && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={proceedToNextStep}
                disabled={!canProceed()}
                className="px-6 active:scale-[0.97]"
              >
                Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Results - Step-through reveal */}
          {phase === "results" && (
            <AfterExplanationCard
              results={results}
              isLoading={isLoading}
              onComplete={handleExplanationComplete}
            />
          )}

          {/* Post-explanation options */}
          {phase === "results" && !isLoading && results && explanationComplete && (
            <div className="animate-fade-in space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Want to talk through anything else?
              </p>
              <div className="flex gap-2">
                <Button onClick={handleStartFollowUp} className="active:scale-[0.97]">
                  Keep talking
                </Button>
                <Button onClick={() => goToPhase("complete")} variant="outline" className="active:scale-[0.97]">
                  I'm done
                </Button>
              </div>
            </div>
          )}

          {/* Follow-up chat */}
          <AfterFollowUpChat
            messages={followUpMessages}
            onSendMessage={handleFollowUpSubmit}
            onDone={handleFollowUpDone}
            isLoading={isFollowUpLoading}
            isActive={phase === "follow-up-chat"}
          />

          {/* Complete - resources and actions */}
          {phase === "complete" && (
            <div className="space-y-5 animate-fade-in">
              <div className="border border-border/50 rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">If someone was hurt</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  If the other person was hurt or uncomfortable, they might need support too.
                </p>
                <ul className="space-y-1.5 text-muted-foreground text-sm">
                  <li>• RAINN — <a href="https://rainn.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">rainn.org</a></li>
                  <li>• Crisis Text Line — <a href="https://crisistextline.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">crisistextline.org</a></li>
                  <li>• Love Is Respect — <a href="https://loveisrespect.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">loveisrespect.org</a></li>
                </ul>
              </div>

              <div className="flex gap-3 items-center">
                <Button variant="ghost" onClick={resetFlow} className="text-muted-foreground text-sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start over
                </Button>
                <Button asChild variant="outline" size="sm" className="active:scale-[0.97]">
                  <a href="/">Home</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default After;
