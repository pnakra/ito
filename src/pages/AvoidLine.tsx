import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
import { classifyRisk, formatSelectionsForAI, type DecisionState } from "@/lib/riskClassification";
import { useSessionRiskTracking } from "@/hooks/useSessionRiskTracking";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, RotateCcw, Shield } from "lucide-react";
import type { RiskLevel } from "@/data/scenarios";

type FlowPhase = 
  | "welcome"
  | "intent"
  | "consent-signal"
  | "context-factors"
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

const intentOptions: StepOption[] = [
  { id: "go-to-their-place", label: "Go to their place" },
  { id: "invite-to-mine", label: "Invite them to mine" },
  { id: "keep-texting", label: "Keep texting / messaging" },
  { id: "physical-move", label: "Make a physical move" },
  { id: "not-sure", label: "I'm not sure yet" }
];

const consentSignalOptions: StepOption[] = [
  { id: "clear-yes", label: "Clear yes in words", description: "They explicitly said yes or expressed clear interest verbally" },
  { id: "enthusiastic-actions", label: "Enthusiastic actions", description: "They're initiating, leaning in, reciprocating" },
  { id: "mixed-signals", label: "Mixed / unclear signals", description: "Sometimes interested, sometimes pulling back" },
  { id: "no-response", label: "No response", description: "They haven't replied or acknowledged" },
  { id: "said-no", label: "They said no or pulled away", description: "Verbal refusal or physical withdrawal" }
];

const contextFactorOptions: StepOption[] = [
  { id: "alcohol", label: "Alcohol or drugs involved" },
  { id: "experience-gap", label: "One of us is much more experienced" },
  { id: "age-imbalance", label: "Age or power imbalance" },
  { id: "emotional-pressure", label: "Emotional pressure" },
  { id: "none", label: "None of these" }
];

const AvoidLine = () => {
  const [phase, setPhase] = useState<FlowPhase>("welcome");
  const [decisions, setDecisions] = useState<DecisionState>({
    intent: null,
    consentSignal: null,
    contextFactors: [],
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
    coercivePatternCount 
  } = useSessionRiskTracking();

  const handleIntentSelect = (id: string) => {
    setDecisions(prev => ({ ...prev, intent: id }));
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

  const proceedToNextStep = () => {
    if (phase === "intent" && decisions.intent) {
      setPhase("consent-signal");
    } else if (phase === "consent-signal" && decisions.consentSignal) {
      setPhase("context-factors");
    } else if (phase === "context-factors" && decisions.contextFactors.length > 0) {
      // Go to additional context step
      setPhase("additional-context");
    }
  };

  const handleContextInputContinue = () => {
    // Calculate risk and proceed
    const result = classifyRisk(decisions);
    setRiskResult(result);
    
    const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
    
    // Check for refusal condition: repeated coercive language + RED + seeking reassurance
    // We check coercivePatternCount from previous runs + current flagged words
    if (result.level === "red" && hasFlaggedWords && coercivePatternCount >= 1) {
      // This is their 2nd+ time with coercive language at RED - refuse
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
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, formattedSelections]);
      
      const { data, error } = await supabase.functions.invoke("analyze-vibecheck", {
        body: { 
          scenario: formattedSelections,
          precomputedRiskLevel: riskLevel
        }
      });

      if (error) throw error;

      setAnalysis({
        riskLevel: riskLevel, // Use our computed level, not the AI's
        assessment: data.assessment,
        whatsHappening: data.whatsHappening,
        whatNotToDo: data.whatNotToDo,
        whatToDoInstead: data.whatToDoInstead,
        realTalk: data.realTalk
      });
    } catch (error) {
      console.error("Error fetching explanation:", error);
      // Provide fallback
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
      // Build context from conversation history
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
      
      // Go back to explanation to show updated response
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
    setDecisions({ intent: null, consentSignal: null, contextFactors: [], additionalContext: "" });
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
    if (phase === "intent") return !!decisions.intent;
    if (phase === "consent-signal") return !!decisions.consentSignal;
    if (phase === "context-factors") return decisions.contextFactors.length > 0;
    return false;
  }, [phase, decisions]);

  // Determine which explanation card to show based on risk level
  const isNeutralRisk = riskResult?.level === "green";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Session Pattern Warning */}
          {shouldShowPatternWarning && phase === "welcome" && (
            <SessionPatternWarning />
          )}

          {/* Welcome */}
          {phase === "welcome" && (
            <Card className="p-8 text-center animate-in fade-in duration-300">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/20">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">Before You Act</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Answer a few quick questions. Get a reality check. 
                <br />No judgment, no data stored.
              </p>
              <Button 
                size="lg" 
                onClick={() => setPhase("intent")}
                className="px-8"
              >
                Start <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Card>
          )}

          {/* Step 1: Intent */}
          <DecisionStep
            stepNumber={1}
            title="What are you thinking about doing next?"
            options={intentOptions}
            selectedValues={decisions.intent ? [decisions.intent] : []}
            onSelect={handleIntentSelect}
            isActive={phase === "intent"}
          />

          {/* Step 2: Consent Signal */}
          <DecisionStep
            stepNumber={2}
            title="What signals have you gotten from them?"
            options={consentSignalOptions}
            selectedValues={decisions.consentSignal ? [decisions.consentSignal] : []}
            onSelect={handleConsentSignalSelect}
            isActive={phase === "consent-signal"}
          />

          {/* Step 3: Context Factors */}
          <DecisionStep
            stepNumber={3}
            title="Anything here that might complicate consent?"
            subtitle="Select all that apply"
            options={contextFactorOptions}
            selectedValues={decisions.contextFactors}
            multiSelect={true}
            onSelect={handleContextFactorSelect}
            isActive={phase === "context-factors"}
          />

          {/* Step 4: Additional Context (free text) */}
          <ContextInput
            value={decisions.additionalContext}
            onChange={(value) => setDecisions(prev => ({ ...prev, additionalContext: value }))}
            onContinue={handleContextInputContinue}
            isActive={phase === "additional-context"}
          />

          {/* Continue Button (for button steps only) */}
          {(phase === "intent" || phase === "consent-signal" || phase === "context-factors") && (
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
