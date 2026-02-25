import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import DecisionStep, { type StepOption } from "@/components/prevention/DecisionStep";
import ContextInput from "@/components/prevention/ContextInput";
import StopMoment from "@/components/prevention/StopMoment";
import OutcomeCheck from "@/components/prevention/OutcomeCheck";
import OutcomeFeedback from "@/components/prevention/OutcomeFeedback";
import AnimatedExplanationCard from "@/components/prevention/AnimatedExplanationCard";
import NeutralExplanationCard from "@/components/prevention/NeutralExplanationCard";
import PostExplanationChoice from "@/components/prevention/PostExplanationChoice";
import ConversationalChat from "@/components/prevention/ConversationalChat";
import SessionPatternWarning from "@/components/prevention/SessionPatternWarning";
import RefusalCard from "@/components/prevention/RefusalCard";
import AfterHandoff from "@/components/prevention/AfterHandoff";
import MoveSelection, { type MoveType, MOVE_OPTIONS } from "@/components/prevention/MoveSelection";
import MutualityGrounding from "@/components/prevention/MutualityGrounding";
import { classifyRisk, formatSelectionsForAI, type DecisionState } from "@/lib/riskClassification";
import { useSessionRiskTracking } from "@/hooks/useSessionRiskTracking";
import { supabase } from "@/integrations/supabase/client";
import { logChoice, logFreetext, logAIResponse, resetSessionId } from "@/lib/submissionLogger";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { RiskLevel } from "@/types/risk";

type FlowPhase = 
  | "welcome"
  | "move-selection"
  | "orientation"
  | "consent-signal"
  | "context-factors"
  | "momentum"
  | "additional-context"
  | "stop-moment"
  | "explanation"
  | "grounding"
  | "post-explanation-choice"
  | "follow-up-chat"
  | "outcome"
  | "outcome-feedback"
  | "refusal";

interface AnalysisData {
  riskLevel: RiskLevel;
  signalLabel: string;
  why: string[];
  suggestion: string;
}

// STEP 0: Orientation options
const orientationOptions: StepOption[] = [
  { id: "texting", label: "We're texting or messaging" },
  { id: "in-person", label: "We're together in person" },
  { id: "party-group", label: "We're at a party or with other people" },
  { id: "already-happened", label: "Something already happened" },
  { id: "not-sure", label: "I'm not sure" }
];

// STEP 1: Consent signal options (observation-first) - contextualized with selected move
const getConsentSignalOptions = (move: MoveType | null): StepOption[] => {
  const moveLabel = move && move !== "not-sure"
    ? MOVE_OPTIONS.find(m => m.id === move)?.label.toLowerCase()
    : "this";
  return [
    { id: "clear-yes", label: `They've said they want to ${moveLabel}`, description: "They used words like 'yes', 'I want to', or asked you to" },
    { id: "enthusiastic-actions", label: "They seem actually into it, not just going along", description: "Leaning in, touching you back, making eye contact, smiling" },
    { id: "mixed-signals", label: "Hard to tell what they want", description: "Sometimes engaged, sometimes distant, or their words and body don't match" },
    { id: "no-response", label: "They're quiet or haven't really said anything", description: "No clear reaction, looking away, or just going along without enthusiasm" },
    { id: "said-no", label: "They said no or pulled away", description: "Verbally declined, moved away, or created physical distance" }
  ];
};

// STEP 2: Context factors
const contextFactorOptions: StepOption[] = [
  { id: "alcohol", label: "Alcohol or drugs are involved" },
  { id: "experience-gap", label: "One of us has done this more than the other" },
  { id: "age-imbalance", label: "One of us is older or in charge" },
  { id: "emotional-pressure", label: "Someone might feel like they have to" },
  { id: "none", label: "None of these" }
];

// STEP 3: Momentum check - contextualized
const getMomentumOptions = (move: MoveType | null): StepOption[] => {
  const moveLabel = move && move !== "not-sure"
    ? MOVE_OPTIONS.find(m => m.id === move)?.label.toLowerCase()
    : null;
  return [
    { id: "toward-physical", label: moveLabel ? `I want to ${moveLabel}` : "I want to move forward physically" },
    { id: "staying-flirty", label: "Just flirting or vibing" },
    { id: "slow-down", label: "I want to slow down" },
    { id: "dont-know", label: "I'm not sure" }
  ];
};

const Before = () => {
  const [phase, setPhase] = useState<FlowPhase>("move-selection");
  const [phaseHistory, setPhaseHistory] = useState<FlowPhase[]>([]);
  const [selectedMove, setSelectedMove] = useState<MoveType | null>(null);
  const [decisions, setDecisions] = useState<DecisionState>({
    orientation: null,
    consentSignal: null,
    contextFactors: [],
    momentum: null,
    additionalContext: ""
  });
  const [riskResult, setRiskResult] = useState<{ level: RiskLevel; stopMessage: string; flaggedWords?: string[] } | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialContext, setInitialContext] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [explanationComplete, setExplanationComplete] = useState(false);

  // Contextualized options based on selected move
  const consentSignalOptions = getConsentSignalOptions(selectedMove);
  const momentumOptions = getMomentumOptions(selectedMove);

  const { 
    shouldShowPatternWarning, 
    recordRun,
    coercivePatternCount,
    yellowOrRedCount
  } = useSessionRiskTracking();

  const handleMoveSelect = (move: MoveType) => {
    setSelectedMove(move);
    logChoice("before", "move-selection", move);
  };

  const handleMoveContinue = () => {
    setPhaseHistory(prev => [...prev, phase]);
    setPhase("orientation");
  };

  // Navigate back to previous step (or home if at first step)
  const handleBack = () => {
    if (phaseHistory.length > 0) {
      const newHistory = [...phaseHistory];
      const previousPhase = newHistory.pop()!;
      setPhaseHistory(newHistory);
      setPhase(previousPhase);
    }
  };

  // Determine if back should go to previous step or home
  const isInQuestionFlow = ["orientation", "consent-signal", "context-factors", "momentum", "additional-context"].includes(phase);

  const handleOrientationSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, orientation: id }));
    logChoice("before", "orientation", id);
  };

  const handleConsentSignalSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, consentSignal: id }));
    logChoice("before", "consent-signal", id);
  };

  const handleContextFactorSelect = (id: string) => {
    setDecisions(prev => {
      let newFactors: string[];
      if (id === "none") {
        newFactors = ["none"];
      } else {
        const withoutNone = prev.contextFactors.filter(f => f !== "none");
        if (withoutNone.includes(id)) {
          newFactors = withoutNone.filter(f => f !== id);
        } else {
          newFactors = [...withoutNone, id];
        }
      }
      logChoice("before", "context-factors", newFactors);
      return { ...prev, contextFactors: newFactors };
    });
  };

  const handleMomentumSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, momentum: id }));
    logChoice("before", "momentum", id);
  };

  const proceedToNextStep = () => {
    setPhaseHistory(prev => [...prev, phase]);
    if (phase === "orientation" && decisions.orientation) {
      setPhase("consent-signal");
    } else if (phase === "consent-signal" && decisions.consentSignal) {
      setPhase("context-factors");
    } else if (phase === "context-factors" && decisions.contextFactors.length > 0) {
      setPhase("momentum");
    } else if (phase === "momentum" && decisions.momentum) {
      setPhase("additional-context");
    }
  };

  const handleContextInputContinue = () => {
    // Log freetext if provided
    if (decisions.additionalContext.trim()) {
      logFreetext("before", "additional-context", decisions.additionalContext);
    }
    
    const result = classifyRisk(decisions);
    setRiskResult(result);
    
    const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
    
    if (result.level === "red" && hasFlaggedWords && coercivePatternCount >= 1) {
      recordRun(result.level, hasFlaggedWords);
      setPhase("refusal");
      return;
    }
    
    recordRun(result.level, hasFlaggedWords);
    
    if (result.level === "red" || result.level === "yellow") {
      setPhase("stop-moment");
    } else {
      fetchExplanation(result.level, result.flaggedWords);
    }
  };

  const handleStopMomentAcknowledge = () => {
    if (riskResult) {
      fetchExplanation(riskResult.level, riskResult.flaggedWords);
    }
  };

  const fetchExplanation = async (riskLevel: RiskLevel, flaggedWords?: string[]) => {
    setPhase("explanation");
    setIsLoading(true);
    setExplanationComplete(false); // Reset for new explanation
    
    try {
      // Include selected move in the context for AI
      const moveLabel = selectedMove ? MOVE_OPTIONS.find(m => m.id === selectedMove)?.label : null;
      const formattedSelections = formatSelectionsForAI(decisions, flaggedWords, moveLabel);
      setInitialContext(formattedSelections);
      
      const { data, error } = await supabase.functions.invoke("analyze-ito", {
        body: { 
          scenario: formattedSelections,
          precomputedRiskLevel: riskLevel
        }
      });

      if (error) throw error;

      setAnalysis({
        riskLevel: riskLevel,
        signalLabel: data.signalLabel || "Check in with them",
        why: data.why || [],
        suggestion: data.suggestion || "",
      });
      
      // Log AI response summary
      logAIResponse("before", "explanation", `Risk: ${riskLevel} - ${data.signalLabel || "Response generated"}`);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setAnalysis({
        riskLevel: riskLevel,
        signalLabel: "Something went wrong",
        why: ["We couldn't check this right now"],
        suggestion: "When in doubt, slow down and check in verbally.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostExplanationDone = () => {
    setPhase("outcome");
  };

  const handlePostExplanationContinue = () => {
    setChatMessages([]); // Reset chat for new conversation
    setPhase("follow-up-chat");
  };

  const handleFollowUpSubmit = async (message: string) => {
    // Add user message to chat immediately
    const userMessage = { role: "user" as const, content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Log the follow-up message
    logFreetext("before", "follow-up", message);
    
    try {
      // Use the new conversational follow-up function
      const followUpResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ito-followup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            message,
            conversationHistory: chatMessages,
            initialContext,
            riskLevel: riskResult?.level || "yellow",
          }),
        }
      );

      if (!followUpResponse.ok) {
        const errorData = await followUpResponse.json().catch(() => ({}));
        const backendError = typeof errorData?.error === "string" ? errorData.error : "";

        if (followUpResponse.status === 429) {
          throw new Error("You're sending messages quickly. Please wait a few seconds and try again.");
        }

        if (followUpResponse.status === 402) {
          throw new Error("AI credits are temporarily exhausted. Please try again later.");
        }

        throw new Error(backendError || "The assistant couldn't respond right now. Please try again.");
      }

      const followUpData = await followUpResponse.json();
      const responseText = typeof followUpData?.response === "string" ? followUpData.response.trim() : "";

      if (!responseText) {
        throw new Error("The assistant returned an empty response. Please try again.");
      }

      const assistantMessage = { role: "assistant" as const, content: responseText };
      setChatMessages(prev => [...prev, assistantMessage]);
      
      logAIResponse("before", "follow-up-response", responseText);
    } catch (error) {
      console.error("Error in follow-up:", error);
      const userFacingError = error instanceof Error && error.message
        ? error.message
        : "I'm having trouble right now. Can you try again?";

      setChatMessages(prev => [...prev, { 
        role: "assistant" as const, 
        content: userFacingError
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpDone = () => {
    setPhase("outcome");
  };

  const resetFlow = () => {
    setPhase("move-selection");
    setPhaseHistory([]);
    setSelectedMove(null);
    setDecisions({ orientation: null, consentSignal: null, contextFactors: [], momentum: null, additionalContext: "" });
    setRiskResult(null);
    setAnalysis(null);
    setIsLoading(false);
    setInitialContext("");
    setChatMessages([]);
    setSelectedOutcome(null);
    setExplanationComplete(false);
    resetSessionId(); // Start new session on reset
  };

  const handleOutcomeSelect = (outcome: string) => {
    setSelectedOutcome(outcome);
    logChoice("before", "outcome", outcome);
    setPhase("outcome-feedback");
  };

  const canProceed = useCallback(() => {
    if (phase === "move-selection") return !!selectedMove;
    if (phase === "orientation") return !!decisions.orientation;
    if (phase === "consent-signal") return !!decisions.consentSignal;
    if (phase === "context-factors") return decisions.contextFactors.length > 0;
    if (phase === "momentum") return !!decisions.momentum;
    return false;
  }, [phase, decisions, selectedMove]);

  // Determine if we should show uncertainty options (yellow/red risk or user selected "not sure")
  const showUncertaintyOptions = riskResult?.level === "yellow" || riskResult?.level === "red" || selectedMove === "not-sure";

  const shouldShowAfterHandoff = 
    decisions.orientation === "already-happened" || yellowOrRedCount >= 2;

  const isNeutralRisk = riskResult?.level === "green";

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
          
          {shouldShowPatternWarning && phase === "move-selection" && (
            <SessionPatternWarning />
          )}

          {/* Phase 1: Name the Move */}
          <MoveSelection
            selectedMove={selectedMove}
            onSelect={handleMoveSelect}
            onContinue={handleMoveContinue}
            isActive={phase === "move-selection"}
          />

          <DecisionStep
            stepNumber={1}
            title="What's the situation?"
            options={orientationOptions}
            selectedValues={decisions.orientation ? [decisions.orientation] : []}
            onSelect={handleOrientationSelect}
            isActive={phase === "orientation"}
          />

          <DecisionStep
            stepNumber={2}
            title="What are they doing or saying?"
            options={consentSignalOptions}
            selectedValues={decisions.consentSignal ? [decisions.consentSignal] : []}
            onSelect={handleConsentSignalSelect}
            isActive={phase === "consent-signal"}
          />

          <DecisionStep
            stepNumber={3}
            title="Is anything else going on?"
            subtitle="Pick all that apply"
            options={contextFactorOptions}
            selectedValues={decisions.contextFactors}
            multiSelect={true}
            onSelect={handleContextFactorSelect}
            isActive={phase === "context-factors"}
          />

          <DecisionStep
            stepNumber={4}
            title="Where do you want this to go?"
            options={momentumOptions}
            selectedValues={decisions.momentum ? [decisions.momentum] : []}
            onSelect={handleMomentumSelect}
            isActive={phase === "momentum"}
          />

          <ContextInput
            value={decisions.additionalContext}
            onChange={(value) => setDecisions(prev => ({ ...prev, additionalContext: value }))}
            onContinue={handleContextInputContinue}
            isActive={phase === "additional-context"}
          />

          {(phase === "orientation" || phase === "consent-signal" || phase === "context-factors" || phase === "momentum") && (
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

          {phase === "stop-moment" && riskResult && (
            <StopMoment
              riskLevel={riskResult.level}
              stopMessage={riskResult.stopMessage}
              onAcknowledge={handleStopMomentAcknowledge}
            />
          )}

          {phase === "refusal" && (
            <RefusalCard onReset={resetFlow} />
          )}

          {phase === "explanation" && (
            isNeutralRisk ? (
              <NeutralExplanationCard analysis={analysis} isLoading={isLoading} onComplete={() => setExplanationComplete(true)} />
            ) : (
              <AnimatedExplanationCard 
                analysis={analysis} 
                isLoading={isLoading} 
                onComplete={() => setExplanationComplete(true)}
              />
            )
          )}

          {phase === "explanation" && !isLoading && analysis && explanationComplete && (
            <AfterHandoff isActive={shouldShowAfterHandoff} />
          )}

          {/* Phase 3: Grounding Output - shows after explanation */}
          {phase === "explanation" && !isLoading && analysis && explanationComplete && (
            <MutualityGrounding
              selectedMove={selectedMove}
              showUncertaintyOptions={showUncertaintyOptions}
              isActive={true}
            />
          )}

          {phase === "explanation" && !isLoading && analysis && explanationComplete && (
            <PostExplanationChoice
              onDone={handlePostExplanationDone}
              onContinue={handlePostExplanationContinue}
              isActive={true}
            />
          )}

          <ConversationalChat
            messages={chatMessages}
            onSendMessage={handleFollowUpSubmit}
            onDone={handleFollowUpDone}
            isLoading={isLoading}
            isActive={phase === "follow-up-chat"}
          />

          {phase === "outcome" && (
            <>
              <OutcomeCheck onSelect={handleOutcomeSelect} />
              
              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  onClick={resetFlow}
                  className="text-muted-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start over
                </Button>
              </div>
            </>
          )}

          {phase === "outcome-feedback" && selectedOutcome && (
            <OutcomeFeedback outcomeId={selectedOutcome} onReset={resetFlow} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Before;
