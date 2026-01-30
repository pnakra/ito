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
import CrossedLineHandoff from "@/components/prevention/CrossedLineHandoff";
import { classifyRisk, formatSelectionsForAI, type DecisionState } from "@/lib/riskClassification";
import { useSessionRiskTracking } from "@/hooks/useSessionRiskTracking";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, RotateCcw, Shield } from "lucide-react";
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
  { id: "party-group", label: "We're at a party or group setting" },
  { id: "already-happened", label: "Something already happened and I'm unsure" },
  { id: "not-sure", label: "I'm not sure how to describe it" }
];

// STEP 1: Consent signal options (observation-first)
const consentSignalOptions: StepOption[] = [
  { id: "clear-yes", label: "Clearly saying yes or expressing interest in words" },
  { id: "enthusiastic-actions", label: "Actively initiating or reciprocating" },
  { id: "mixed-signals", label: "Mixed or hard to read" },
  { id: "no-response", label: "Quiet or not responding" },
  { id: "said-no", label: "Said no or pulled away" }
];

// STEP 2: Context factors
const contextFactorOptions: StepOption[] = [
  { id: "alcohol", label: "Alcohol or drugs involved" },
  { id: "experience-gap", label: "One of us is much more experienced" },
  { id: "age-imbalance", label: "Age or power imbalance" },
  { id: "emotional-pressure", label: "Emotional pressure" },
  { id: "none", label: "None of these" }
];

// STEP 3: Momentum check (replaces intent)
const momentumOptions: StepOption[] = [
  { id: "toward-physical", label: "Toward something physical" },
  { id: "staying-flirty", label: "Staying flirty or emotional" },
  { id: "slow-down", label: "I want to slow things down" },
  { id: "dont-know", label: "I don't know" }
];

const AvoidLine = () => {
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
    shouldRefuse, 
    recordRun,
    coercivePatternCount,
    yellowOrRedCount
  } = useSessionRiskTracking();

  const handleOrientationSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, orientation: id }));
  };

  const handleConsentSignalSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, consentSignal: id }));
  };

  const handleContextFactorSelect = (id: string) => {
    setDecisions(prev => {
      // "None" is exclusive
      if (id === "none") {
        return { ...prev, contextFactors: ["none"] };
      }
      
      // Remove "none" if selecting another option
      const withoutNone = prev.contextFactors.filter(f => f !== "none");
      
      // Toggle the selection
      if (withoutNone.includes(id)) {
        return { ...prev, contextFactors: withoutNone.filter(f => f !== id) };
      }
      return { ...prev, contextFactors: [...withoutNone, id] };
    });
  };

  const handleMomentumSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, momentum: id }));
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
    // Calculate risk and proceed
    const result = classifyRisk(decisions);
    setRiskResult(result);
    
    const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
    
    // Check for refusal condition: repeated coercive language + RED + seeking reassurance
    if (result.level === "red" && hasFlaggedWords && coercivePatternCount >= 1) {
      recordRun(result.level, hasFlaggedWords);
      setPhase("refusal");
      return;
    }
    
    // Record this run for session tracking
    recordRun(result.level, hasFlaggedWords);
    
    if (result.level === "red" || result.level === "yellow") {
      setPhase("stop-moment");
    } else {
      // Green - go straight to explanation
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
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setAnalysis({
        riskLevel: riskLevel,
        assessment: "We couldn't process this right now, but the risk level still applies.",
        whatsHappening: ["The system encountered an error processing your situation"],
        whatNotToDo: ["Don't proceed if you're uncertain about consent"],
        whatToDoInstead: ["Check in verbally with clear, direct questions"],
        realTalk: "When in doubt, slow down and communicate."
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
  };

  const handleOutcomeSelect = (outcome: string) => {
    console.log("Outcome selected (not stored):", outcome);
    setSelectedOutcome(outcome);
    setPhase("outcome-feedback");
  };

  const canProceed = useCallback(() => {
    if (phase === "orientation") return !!decisions.orientation;
    if (phase === "consent-signal") return !!decisions.consentSignal;
    if (phase === "context-factors") return decisions.contextFactors.length > 0;
    if (phase === "momentum") return !!decisions.momentum;
    return false;
  }, [phase, decisions]);

  // Determine if we should show the crossed-line handoff
  const shouldShowCrossedLineHandoff = 
    decisions.orientation === "already-happened" || yellowOrRedCount >= 2;

  // Determine which explanation card to show based on risk level
  const isNeutralRisk = riskResult?.level === "green";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back button - persistent throughout the flow */}
          <BackButton to="/" />
          
          {/* Session Pattern Warning */}
          {shouldShowPatternWarning && phase === "welcome" && (
            <SessionPatternWarning />
          )}

          {/* Welcome */}
          {phase === "welcome" && (
            <Card className="p-8 text-center animate-fade-in-up">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/20 animate-float">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>Before You Act</h1>
              <p className="text-lg text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Answer a few quick questions. Get a reality check. 
                <br />No judgment, no data stored.
              </p>
              <Button 
                size="lg" 
                onClick={() => setPhase("orientation")}
                className="px-8 animate-fade-in hover:scale-105 transition-transform"
                style={{ animationDelay: '0.3s' }}
              >
                Start <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Card>
          )}

          {/* Step 1: Orientation */}
          <DecisionStep
            stepNumber={1}
            title="Where are you in this situation right now?"
            options={orientationOptions}
            selectedValues={decisions.orientation ? [decisions.orientation] : []}
            onSelect={handleOrientationSelect}
            isActive={phase === "orientation"}
          />

          {/* Step 1: Consent Signals */}
          <DecisionStep
            stepNumber={2}
            title="What have they been doing or saying?"
            options={consentSignalOptions}
            selectedValues={decisions.consentSignal ? [decisions.consentSignal] : []}
            onSelect={handleConsentSignalSelect}
            isActive={phase === "consent-signal"}
          />

          {/* Step 2: Context Factors */}
          <DecisionStep
            stepNumber={3}
            title="Anything here that might affect how clear consent is?"
            subtitle="Select all that apply"
            options={contextFactorOptions}
            selectedValues={decisions.contextFactors}
            multiSelect={true}
            onSelect={handleContextFactorSelect}
            isActive={phase === "context-factors"}
          />

          {/* Step 3: Momentum Check */}
          <DecisionStep
            stepNumber={4}
            title="What direction does this feel like it's heading?"
            options={momentumOptions}
            selectedValues={decisions.momentum ? [decisions.momentum] : []}
            onSelect={handleMomentumSelect}
            isActive={phase === "momentum"}
          />

          {/* Step 5: Additional Context (free text) */}
          <ContextInput
            value={decisions.additionalContext}
            onChange={(value) => setDecisions(prev => ({ ...prev, additionalContext: value }))}
            onContinue={handleContextInputContinue}
            isActive={phase === "additional-context"}
          />

          {/* Continue Button (for button steps only) */}
          {(phase === "orientation" || phase === "consent-signal" || phase === "context-factors" || phase === "momentum") && (
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={proceedToNextStep}
                disabled={!canProceed()}
                className="px-8"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Stop Moment Overlay */}
          {phase === "stop-moment" && riskResult && (
            <StopMoment
              riskLevel={riskResult.level}
              stopMessage={riskResult.stopMessage}
              onAcknowledge={handleStopMomentAcknowledge}
            />
          )}

          {/* Refusal Card */}
          {phase === "refusal" && (
            <RefusalCard onReset={resetFlow} />
          )}

          {/* Explanation Card - use neutral card for green, full card for yellow/red */}
          {phase === "explanation" && (
            isNeutralRisk ? (
              <NeutralExplanationCard analysis={analysis} isLoading={isLoading} />
            ) : (
              <ExplanationCard analysis={analysis} isLoading={isLoading} />
            )
          )}

          {/* Crossed Line Handoff - shown after explanation when applicable */}
          {phase === "explanation" && !isLoading && analysis && (
            <CrossedLineHandoff isActive={shouldShowCrossedLineHandoff} />
          )}

          {/* Post-Explanation Choice */}
          {phase === "explanation" && !isLoading && analysis && (
            <PostExplanationChoice
              onDone={handlePostExplanationDone}
              onContinue={handlePostExplanationContinue}
              isActive={true}
            />
          )}

          {/* Follow-up Chat */}
          <FollowUpChat
            onSubmit={handleFollowUpSubmit}
            onDone={handleFollowUpDone}
            isLoading={isLoading}
            isActive={phase === "follow-up-chat"}
          />

          {/* Outcome Check */}
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

          {/* Outcome Feedback */}
          {phase === "outcome-feedback" && selectedOutcome && (
            <OutcomeFeedback outcomeId={selectedOutcome} onReset={resetFlow} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AvoidLine;
