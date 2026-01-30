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
import ExplanationCard from "@/components/prevention/ExplanationCard";
import NeutralExplanationCard from "@/components/prevention/NeutralExplanationCard";
import PostExplanationChoice from "@/components/prevention/PostExplanationChoice";
import FollowUpChat from "@/components/prevention/FollowUpChat";
import SessionPatternWarning from "@/components/prevention/SessionPatternWarning";
import RefusalCard from "@/components/prevention/RefusalCard";
import AfterHandoff from "@/components/prevention/AfterHandoff";
import { classifyRisk, formatSelectionsForAI, type DecisionState } from "@/lib/riskClassification";
import { useSessionRiskTracking } from "@/hooks/useSessionRiskTracking";
import { supabase } from "@/integrations/supabase/client";
import { logChoice, logFreetext, logAIResponse, resetSessionId } from "@/lib/submissionLogger";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { RiskLevel } from "@/types/risk";

type FlowPhase = 
  | "welcome"
  | "orientation"
  | "consent-signal"
  | "context-factors"
  | "momentum"
  | "additional-context"
  | "stop-moment"
  | "explanation"
  | "post-explanation-choice"
  | "follow-up-chat"
  | "outcome"
  | "outcome-feedback"
  | "refusal";

interface AnalysisData {
  riskLevel: RiskLevel;
  assessment: string;
  whatsHappening: string[];
  whatNotToDo: string[];
  whatToDoInstead: string[];
  realTalk: string;
}

// STEP 0: Orientation options
const orientationOptions: StepOption[] = [
  { id: "texting", label: "We're texting or messaging" },
  { id: "in-person", label: "We're together in person" },
  { id: "party-group", label: "We're at a party or with other people" },
  { id: "already-happened", label: "Something already happened" },
  { id: "not-sure", label: "I'm not sure" }
];

// STEP 1: Consent signal options (observation-first)
const consentSignalOptions: StepOption[] = [
  { id: "clear-yes", label: "They said yes or told me they want to" },
  { id: "enthusiastic-actions", label: "They're starting things or going along with it" },
  { id: "mixed-signals", label: "Hard to tell" },
  { id: "no-response", label: "They're quiet or not really responding" },
  { id: "said-no", label: "They said no or moved away" }
];

// STEP 2: Context factors
const contextFactorOptions: StepOption[] = [
  { id: "alcohol", label: "Alcohol or drugs are involved" },
  { id: "experience-gap", label: "One of us has done this more than the other" },
  { id: "age-imbalance", label: "One of us is older or in charge" },
  { id: "emotional-pressure", label: "Someone feels pressured" },
  { id: "none", label: "None of these" }
];

// STEP 3: Momentum check (replaces intent)
const momentumOptions: StepOption[] = [
  { id: "toward-physical", label: "Heading toward something physical" },
  { id: "staying-flirty", label: "Just flirting or talking" },
  { id: "slow-down", label: "I want to slow down" },
  { id: "dont-know", label: "I don't know" }
];

const Before = () => {
  const [phase, setPhase] = useState<FlowPhase>("welcome");
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
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);

  const { 
    shouldShowPatternWarning, 
    recordRun,
    coercivePatternCount,
    yellowOrRedCount
  } = useSessionRiskTracking();

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
    
    try {
      const formattedSelections = formatSelectionsForAI(decisions, flaggedWords);
      setConversationHistory(prev => [...prev, formattedSelections]);
      
      const { data, error } = await supabase.functions.invoke("analyze-vibecheck", {
        body: { 
          scenario: formattedSelections,
          precomputedRiskLevel: riskLevel
        }
      });

      if (error) throw error;

      setAnalysis({
        riskLevel: riskLevel,
        assessment: data.assessment,
        whatsHappening: data.whatsHappening,
        whatNotToDo: data.whatNotToDo,
        whatToDoInstead: data.whatToDoInstead,
        realTalk: data.realTalk
      });
      
      // Log AI response summary
      logAIResponse("before", "explanation", `Risk: ${riskLevel} - ${data.assessment?.slice(0, 100) || "Response generated"}`);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setAnalysis({
        riskLevel: riskLevel,
        assessment: "We couldn't check this right now.",
        whatsHappening: ["Something went wrong on our end"],
        whatNotToDo: ["Don't keep going if you're not sure"],
        whatToDoInstead: ["Ask them directly how they're feeling"],
        realTalk: "When in doubt, slow down."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostExplanationDone = () => {
    setPhase("outcome");
  };

  const handlePostExplanationContinue = () => {
    setPhase("follow-up-chat");
  };

  const handleFollowUpSubmit = async (message: string) => {
    setIsLoading(true);
    
    // Log the follow-up message
    logFreetext("before", "follow-up", message);
    
    try {
      const fullContext = [
        ...conversationHistory,
        `\nFollow-up from user: "${message}"`
      ].join("\n\n---\n\n");
      
      setConversationHistory(prev => [...prev, `User follow-up: ${message}`]);
      
      const { data, error } = await supabase.functions.invoke("analyze-vibecheck", {
        body: { 
          scenario: fullContext,
          precomputedRiskLevel: riskResult?.level || "yellow"
        }
      });

      if (error) throw error;

      setAnalysis({
        riskLevel: riskResult?.level || "yellow",
        assessment: data.assessment,
        whatsHappening: data.whatsHappening,
        whatNotToDo: data.whatNotToDo,
        whatToDoInstead: data.whatToDoInstead,
        realTalk: data.realTalk
      });
      
      logAIResponse("before", "follow-up-response", data.assessment?.slice(0, 100) || "Follow-up response");
      
      setPhase("explanation");
    } catch (error) {
      console.error("Error in follow-up:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpDone = () => {
    setPhase("outcome");
  };

  const resetFlow = () => {
    setPhase("welcome");
    setDecisions({ orientation: null, consentSignal: null, contextFactors: [], momentum: null, additionalContext: "" });
    setRiskResult(null);
    setAnalysis(null);
    setIsLoading(false);
    setConversationHistory([]);
    setSelectedOutcome(null);
    resetSessionId(); // Start new session on reset
  };

  const handleOutcomeSelect = (outcome: string) => {
    setSelectedOutcome(outcome);
    logChoice("before", "outcome", outcome);
    setPhase("outcome-feedback");
  };

  const canProceed = useCallback(() => {
    if (phase === "orientation") return !!decisions.orientation;
    if (phase === "consent-signal") return !!decisions.consentSignal;
    if (phase === "context-factors") return decisions.contextFactors.length > 0;
    if (phase === "momentum") return !!decisions.momentum;
    return false;
  }, [phase, decisions]);

  const shouldShowAfterHandoff = 
    decisions.orientation === "already-happened" || yellowOrRedCount >= 2;

  const isNeutralRisk = riskResult?.level === "green";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackButton to="/" />
          
          {shouldShowPatternWarning && phase === "welcome" && (
            <SessionPatternWarning />
          )}

          {phase === "welcome" && (
            <Card className="p-8 text-center border-border/50 animate-fade-in">
              <h1 className="text-2xl font-semibold mb-3">
                Before anything happens
              </h1>
              <p className="text-muted-foreground mb-6">
                Answer a few questions. See what comes up.
                <br />Nothing is saved.
              </p>
              <Button 
                size="lg" 
                onClick={() => setPhase("orientation")}
                className="px-8"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          )}

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
            title="Where is this going?"
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
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={proceedToNextStep}
                disabled={!canProceed()}
                className="px-8"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
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
              <NeutralExplanationCard analysis={analysis} isLoading={isLoading} />
            ) : (
              <ExplanationCard analysis={analysis} isLoading={isLoading} />
            )
          )}

          {phase === "explanation" && !isLoading && analysis && (
            <AfterHandoff isActive={shouldShowAfterHandoff} />
          )}

          {phase === "explanation" && !isLoading && analysis && (
            <PostExplanationChoice
              onDone={handlePostExplanationDone}
              onContinue={handlePostExplanationContinue}
              isActive={true}
            />
          )}

          <FollowUpChat
            onSubmit={handleFollowUpSubmit}
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
