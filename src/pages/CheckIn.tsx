import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import NarrativeInput from "@/components/narrative/NarrativeInput";
import GuidedMode from "@/components/narrative/GuidedMode";
import AdaptiveFollowUp from "@/components/narrative/AdaptiveFollowUp";
import StopMoment from "@/components/prevention/StopMoment";
import AnimatedExplanationCard from "@/components/prevention/AnimatedExplanationCard";
import NeutralExplanationCard from "@/components/prevention/NeutralExplanationCard";
import PostExplanationChoice from "@/components/prevention/PostExplanationChoice";
import ConversationalChat from "@/components/prevention/ConversationalChat";
import MutualityGrounding from "@/components/prevention/MutualityGrounding";
import SessionPatternWarning from "@/components/prevention/SessionPatternWarning";
import RefusalCard from "@/components/prevention/RefusalCard";
import AfterHandoff from "@/components/prevention/AfterHandoff";
import OutcomeCheck from "@/components/prevention/OutcomeCheck";
import OutcomeFeedback from "@/components/prevention/OutcomeFeedback";
import AfterExplanationCard from "@/components/after/AfterExplanationCard";
import { detectGaps, narrativeToDecisionState, type DetectedGap } from "@/lib/narrativeGapDetection";
import { classifyRisk, detectFlagWords, formatSelectionsForAI } from "@/lib/riskClassification";
import { useSessionRiskTracking } from "@/hooks/useSessionRiskTracking";
import { supabase } from "@/integrations/supabase/client";
import { logChoice, logFreetext, logAIResponse, resetSessionId } from "@/lib/submissionLogger";
import type { RiskLevel } from "@/types/risk";

type FlowPhase =
  | "narrative-input"
  | "guided-mode"
  | "follow-up-questions"
  | "stop-moment"
  | "explanation"
  | "after-explanation"
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

interface AfterAnalysisData {
  clarityCheck: string;
  otherPersonPerspective: string;
  perspectiveDisclaimer?: string;
  accountabilitySteps: string;
  avoidingRepetition: string;
  yourPatterns: string;
}

const CheckIn = () => {
  const [phase, setPhase] = useState<FlowPhase>("narrative-input");
  
  // Cumulative narrative context — NEVER reset, only append
  const [narrativeHistory, setNarrativeHistory] = useState<string[]>([]);
  
  // High-water-mark risk — can only stay same or increase
  const [riskHighWaterMark, setRiskHighWaterMark] = useState<RiskLevel>("green");
  const [riskResult, setRiskResult] = useState<{ level: RiskLevel; stopMessage: string; flaggedWords?: string[] } | null>(null);
  
  // Flow routing
  const [detectedTiming, setDetectedTiming] = useState<"before" | "after" | "unclear">("unclear");
  
  // Gap detection
  const [gaps, setGaps] = useState<DetectedGap[]>([]);
  
  // Analysis results
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [afterAnalysis, setAfterAnalysis] = useState<AfterAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanationComplete, setExplanationComplete] = useState(false);
  
  // Follow-up chat
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  
  // Session tracking
  const {
    shouldShowPatternWarning,
    recordRun,
    coercivePatternCount,
    yellowOrRedCount,
  } = useSessionRiskTracking();

  // Get cumulative text from all narrative inputs
  const getCumulativeText = useCallback(() => {
    return narrativeHistory.join("\n\n");
  }, [narrativeHistory]);

  // Update risk high-water-mark — can only go up
  const updateRiskLevel = useCallback((newLevel: RiskLevel) => {
    const hierarchy: Record<RiskLevel, number> = { green: 0, yellow: 1, red: 2 };
    setRiskHighWaterMark(prev => {
      if (hierarchy[newLevel] > hierarchy[prev]) return newLevel;
      return prev;
    });
  }, []);

  // Run safety classification on cumulative text
  const runSafetyClassification = useCallback((text: string) => {
    // Map narrative to decision state for classifyRisk()
    const gapResult = detectGaps(text);
    const decisionState = narrativeToDecisionState(text, gapResult.detectedTiming);
    const result = classifyRisk(decisionState);
    
    updateRiskLevel(result.level);
    setRiskResult(result);
    setDetectedTiming(gapResult.detectedTiming);
    
    return { riskResult: result, gapResult, decisionState };
  }, [updateRiskLevel]);

  // Handle initial narrative submission
  const handleNarrativeSubmit = (text: string) => {
    logFreetext("before", "narrative-input", text);
    
    const newHistory = [...narrativeHistory, text];
    setNarrativeHistory(newHistory);
    
    const cumulativeText = newHistory.join("\n\n");
    const { riskResult: result, gapResult } = runSafetyClassification(cumulativeText);
    
    const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
    
    // Check for immediate refusal (coercive pattern repeat)
    if (result.level === "red" && hasFlaggedWords && coercivePatternCount >= 1) {
      recordRun(result.level, hasFlaggedWords);
      setPhase("refusal");
      return;
    }
    
    recordRun(result.level, hasFlaggedWords);
    
    // If we have gaps and safety allows, ask follow-ups first
    if (gapResult.gaps.length > 0 && !gapResult.hasMinimumSafetyContext && result.level !== "red") {
      setGaps(gapResult.gaps);
      setPhase("follow-up-questions");
      return;
    }
    
    // Safety gate: stop moment for red/yellow
    if (result.level === "red" || result.level === "yellow") {
      setPhase("stop-moment");
      return;
    }
    
    // Green: go straight to explanation
    fetchExplanation(cumulativeText, result.level, gapResult.detectedTiming);
  };

  // Handle follow-up question answers
  const handleFollowUpAnswers = (answers: Record<string, string>) => {
    // Append answers to narrative history
    const answerLines = Object.entries(answers)
      .filter(([, v]) => v.trim())
      .map(([key, value]) => {
        const gap = gaps.find(g => g.id === key);
        return gap ? `Q: ${gap.question}\nA: ${value}` : value;
      })
      .join("\n\n");
    
    if (answerLines) {
      logFreetext("before", "follow-up-answers", answerLines);
      const newHistory = [...narrativeHistory, answerLines];
      setNarrativeHistory(newHistory);
      
      // Re-run safety on cumulative context
      const cumulativeText = newHistory.join("\n\n");
      const { riskResult: result, gapResult } = runSafetyClassification(cumulativeText);
      
      const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
      recordRun(result.level, hasFlaggedWords);
      
      if (result.level === "red" || result.level === "yellow") {
        setPhase("stop-moment");
        return;
      }
      
      fetchExplanation(cumulativeText, result.level, gapResult.detectedTiming);
    } else {
      // Skipped all questions — proceed with what we have
      handleFollowUpSkip();
    }
  };

  const handleFollowUpSkip = () => {
    const cumulativeText = getCumulativeText();
    const effectiveRisk = riskHighWaterMark;
    
    if (effectiveRisk === "red" || effectiveRisk === "yellow") {
      setPhase("stop-moment");
      return;
    }
    
    fetchExplanation(cumulativeText, effectiveRisk, detectedTiming);
  };

  // Handle stop moment acknowledgment
  const handleStopMomentAcknowledge = () => {
    const cumulativeText = getCumulativeText();
    fetchExplanation(cumulativeText, riskHighWaterMark, detectedTiming);
  };

  // Fetch AI explanation
  const fetchExplanation = async (text: string, riskLevel: RiskLevel, timing: "before" | "after" | "unclear") => {
    const isAfter = timing === "after";
    setPhase(isAfter ? "after-explanation" : "explanation");
    setIsLoading(true);
    setExplanationComplete(false);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-narrative", {
        body: {
          narrativeText: text,
          precomputedRiskLevel: riskLevel,
          detectedTiming: timing,
          isFollowUp: narrativeHistory.length > 1,
        }
      });

      if (error) throw error;

      if (isAfter) {
        setAfterAnalysis(data as AfterAnalysisData);
      } else {
        setAnalysis({
          riskLevel,
          signalLabel: data.signalLabel || "Check in with them",
          why: data.why || [],
          suggestion: data.suggestion || "",
        });
      }

      logAIResponse("before", "narrative-explanation", `Risk: ${riskLevel} - ${data.signalLabel || "Response generated"}`);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      if (isAfter) {
        setAfterAnalysis({
          clarityCheck: "We couldn't check this right now.",
          otherPersonPerspective: "",
          yourPatterns: "",
          accountabilitySteps: "When in doubt, slow down and check in.",
          avoidingRepetition: "",
        });
      } else {
        setAnalysis({
          riskLevel,
          signalLabel: "Something went wrong",
          why: ["We couldn't check this right now"],
          suggestion: "When in doubt, slow down and check in verbally.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Post-explanation choices
  const handlePostExplanationDone = () => setPhase("outcome");
  
  const handlePostExplanationContinue = () => {
    setChatMessages([]);
    setPhase("follow-up-chat");
  };

  // Follow-up chat — iterative advice with cumulative context
  const handleFollowUpSubmit = async (message: string) => {
    const userMessage = { role: "user" as const, content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Append to narrative history for cumulative context
    const newHistory = [...narrativeHistory, message];
    setNarrativeHistory(newHistory);
    
    // Re-run safety on cumulative text
    const cumulativeText = newHistory.join("\n\n");
    const { riskResult: result } = runSafetyClassification(cumulativeText);
    
    logFreetext("before", "follow-up", message);
    
    try {
      const { data, error } = await supabase.functions.invoke("ito-followup", {
        body: {
          message,
          conversationHistory: chatMessages,
          initialContext: cumulativeText,
          riskLevel: riskHighWaterMark, // Always use high-water-mark
        }
      });

      if (error) throw error;

      const assistantMessage = { role: "assistant" as const, content: data.response };
      setChatMessages(prev => [...prev, assistantMessage]);
      logAIResponse("before", "follow-up-response", data.response || "Follow-up response");
    } catch (error) {
      console.error("Error in follow-up:", error);
      setChatMessages(prev => [...prev, {
        role: "assistant" as const,
        content: "I'm having trouble right now. Can you try again?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpDone = () => setPhase("outcome");

  const handleOutcomeSelect = (outcome: string) => {
    setSelectedOutcome(outcome);
    logChoice("before", "outcome", outcome);
    setPhase("outcome-feedback");
  };

  const resetFlow = () => {
    setPhase("narrative-input");
    setNarrativeHistory([]);
    setRiskHighWaterMark("green");
    setRiskResult(null);
    setDetectedTiming("unclear");
    setGaps([]);
    setAnalysis(null);
    setAfterAnalysis(null);
    setIsLoading(false);
    setExplanationComplete(false);
    setChatMessages([]);
    setSelectedOutcome(null);
    resetSessionId();
  };

  const isNeutralRisk = riskHighWaterMark === "green";
  const showUncertaintyOptions = riskHighWaterMark === "yellow" || riskHighWaterMark === "red";
  const shouldShowAfterHandoff = yellowOrRedCount >= 2;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {phase !== "narrative-input" && phase !== "guided-mode" ? (
            <BackButton label="Back" onClick={() => {
              if (phase === "follow-up-questions") setPhase("narrative-input");
              else if (phase === "stop-moment") setPhase("narrative-input");
              else resetFlow();
            }} />
          ) : phase === "guided-mode" ? null : (
            <BackButton to="/" />
          )}

          {shouldShowPatternWarning && phase === "narrative-input" && (
            <SessionPatternWarning />
          )}

          {/* Phase 1: Narrative Input */}
          {phase === "narrative-input" && (
            <NarrativeInput
              onSubmit={handleNarrativeSubmit}
              onGuidedMode={() => setPhase("guided-mode")}
              isLoading={isLoading}
            />
          )}

          {/* Phase 1b: Guided Mode */}
          {phase === "guided-mode" && (
            <GuidedMode
              onSubmit={handleNarrativeSubmit}
              onBack={() => setPhase("narrative-input")}
              isLoading={isLoading}
            />
          )}

          {/* Phase 2: Adaptive Follow-Up Questions */}
          {phase === "follow-up-questions" && (
            <AdaptiveFollowUp
              gaps={gaps}
              onSubmit={handleFollowUpAnswers}
              onSkip={handleFollowUpSkip}
              isLoading={isLoading}
            />
          )}

          {/* Stop Moment */}
          {phase === "stop-moment" && riskResult && (
            <StopMoment
              riskLevel={riskHighWaterMark as RiskLevel}
              stopMessage={riskResult.stopMessage}
              onAcknowledge={handleStopMomentAcknowledge}
            />
          )}

          {/* Refusal */}
          {phase === "refusal" && (
            <RefusalCard onReset={resetFlow} />
          )}

          {/* Before-flow Explanation */}
          {phase === "explanation" && (
            isNeutralRisk ? (
              <NeutralExplanationCard
                analysis={analysis}
                isLoading={isLoading}
                onComplete={() => setExplanationComplete(true)}
              />
            ) : (
              <AnimatedExplanationCard
                analysis={analysis}
                isLoading={isLoading}
                onComplete={() => setExplanationComplete(true)}
              />
            )
          )}

          {/* After-flow Explanation */}
          {phase === "after-explanation" && (
            <AfterExplanationCard
              results={afterAnalysis}
              isLoading={isLoading}
              onComplete={() => setExplanationComplete(true)}
            />
          )}

          {/* After Handoff suggestion */}
          {(phase === "explanation" || phase === "after-explanation") && !isLoading && explanationComplete && (
            <AfterHandoff isActive={shouldShowAfterHandoff} />
          )}

          {/* Mutuality Grounding (before-flow only) */}
          {phase === "explanation" && !isLoading && analysis && explanationComplete && (
            <MutualityGrounding
              selectedMove={null}
              showUncertaintyOptions={showUncertaintyOptions}
              isActive={true}
            />
          )}

          {/* Post-explanation choice */}
          {(phase === "explanation" || phase === "after-explanation") && !isLoading && explanationComplete && (
            <PostExplanationChoice
              onDone={handlePostExplanationDone}
              onContinue={handlePostExplanationContinue}
              isActive={true}
            />
          )}

          {/* Follow-up Chat */}
          <ConversationalChat
            messages={chatMessages}
            onSendMessage={handleFollowUpSubmit}
            onDone={handleFollowUpDone}
            isLoading={isLoading}
            isActive={phase === "follow-up-chat"}
          />

          {/* Outcome */}
          {phase === "outcome" && (
            <OutcomeCheck onSelect={handleOutcomeSelect} />
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

export default CheckIn;
