import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import NarrativeInput from "@/components/narrative/NarrativeInput";
import GuidedMode from "@/components/narrative/GuidedMode";
import SignalFloor from "@/components/narrative/SignalFloor";
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
import { logChoice, logFreetext, logAIResponse, resetSessionId } from "@/lib/submissionLogger";
import type { RiskLevel } from "@/types/risk";
import { type StructuredSignals, serializeSignals, getTopMissingSignal } from "@/types/signals";

type FlowPhase =
  | "narrative-input"
  | "guided-mode"
  | "signal-floor"
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

const cleanText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const cleanList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
};

const MAX_FOLLOWUP_FETCH_RETRIES = 2;
const FOLLOWUP_RETRY_BASE_DELAY_MS = 350;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isLikelyNetworkFetchError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const normalized = error.message.toLowerCase();
  return normalized.includes("failed to fetch") || normalized.includes("load failed") || normalized.includes("networkerror");
};

const CheckIn = () => {
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState<FlowPhase>(
    searchParams.get("mode") === "guided" ? "guided-mode" : "narrative-input"
  );
  
  // Cumulative narrative context — NEVER reset, only append
  const [narrativeHistory, setNarrativeHistory] = useState<string[]>([]);
  
  // Structured signals collected from signal floor or guided mode
  const [structuredSignals, setStructuredSignals] = useState<StructuredSignals>({});
  
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

  // Demo mode: auto-submit pre-filled scenario
  useEffect(() => {
    if (searchParams.get("demo") !== "true") return;
    const raw = sessionStorage.getItem("ito-demo-scenario");
    if (!raw) return;
    sessionStorage.removeItem("ito-demo-scenario");

    try {
      const { signals, narrative, worried } = JSON.parse(raw);
      const parts: string[] = [];
      if (narrative) parts.push(narrative);
      if (worried) parts.push(`What I'm worried about: ${worried}`);

      const signalText = serializeSignals(signals);
      if (signalText) parts.push(signalText);

      const text = parts.join("\n\n");
      if (text.trim()) {
        // Skip straight to analysis with pre-filled data
        setNarrativeHistory([text]);
        setStructuredSignals(signals);
        if (signals.timing === "already-happened" || signals.timing === "both") setDetectedTiming("after");
        else if (signals.timing === "deciding") setDetectedTiming("before");

        const gapResult = detectGaps(text);
        const decisionState = narrativeToDecisionState(text, gapResult.detectedTiming);
        const result = classifyRisk(decisionState);
        updateRiskLevel(result.level);
        setRiskResult(result);

        const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
        recordRun(result.level, hasFlaggedWords);

        if (result.level === "red" || result.level === "yellow") {
          setPhase("stop-moment");
        } else {
          const effectiveTiming = signals.timing === "already-happened" ? "after" : signals.timing === "deciding" ? "before" : gapResult.detectedTiming;
          fetchExplanation(text, result.level, effectiveTiming);
        }
      }
    } catch (e) {
      console.error("[ITO] Demo scenario parse error:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const gapResult = detectGaps(text);
    const decisionState = narrativeToDecisionState(text, gapResult.detectedTiming);
    const result = classifyRisk(decisionState);
    
    updateRiskLevel(result.level);
    setRiskResult(result);
    setDetectedTiming(gapResult.detectedTiming);
    
    return { riskResult: result, gapResult, decisionState };
  }, [updateRiskLevel]);

  // Resolve effective timing from structured signals + text detection
  const resolveEffectiveTiming = useCallback((signals: StructuredSignals, textTiming: "before" | "after" | "unclear") => {
    if (signals.timing === "already-happened") return "after";
    if (signals.timing === "deciding") return "before";
    if (signals.timing === "both") return "after";
    return textTiming;
  }, []);

  // Process after signal floor or guided mode signals are collected
  const proceedWithSignals = useCallback((
    cumulativeText: string,
    signals: StructuredSignals,
    riskResult: { level: RiskLevel; stopMessage: string; flaggedWords?: string[] },
    gapResult: ReturnType<typeof detectGaps>
  ) => {
    const hasFlaggedWords = (riskResult.flaggedWords?.length ?? 0) > 0;
    
    if (riskResult.level === "red" && hasFlaggedWords && coercivePatternCount >= 1) {
      recordRun(riskResult.level, hasFlaggedWords);
      setPhase("refusal");
      return;
    }
    
    recordRun(riskResult.level, hasFlaggedWords);
    
    const remainingGaps = gapResult.gaps.filter(gap => {
      if (gap.id === "timing" && signals.timing) return false;
      if (gap.id === "age" && (signals.ageUser || signals.ageOther)) return false;
      return true;
    });
    
    if (remainingGaps.length > 0 && !gapResult.hasMinimumSafetyContext && riskResult.level !== "red") {
      setGaps(remainingGaps);
      setPhase("follow-up-questions");
      return;
    }
    
    if (riskResult.level === "red" || riskResult.level === "yellow") {
      setPhase("stop-moment");
      return;
    }
    
    const effectiveTiming = resolveEffectiveTiming(signals, gapResult.detectedTiming);
    fetchExplanation(cumulativeText, riskResult.level, effectiveTiming);
  }, [coercivePatternCount, recordRun, resolveEffectiveTiming]);

  // Handle initial narrative submission — go to signal floor
  const handleNarrativeSubmit = (text: string) => {
    logFreetext("before", "narrative-input", text);
    
    const newHistory = [...narrativeHistory, text];
    setNarrativeHistory(newHistory);
    
    const cumulativeText = newHistory.join("\n\n");
    const { riskResult: result } = runSafetyClassification(cumulativeText);
    
    const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
    
    if (result.level === "red" && hasFlaggedWords && coercivePatternCount >= 1) {
      recordRun(result.level, hasFlaggedWords);
      setPhase("refusal");
      return;
    }
    
    if (result.level === "red") {
      recordRun(result.level, hasFlaggedWords);
      setPhase("stop-moment");
      return;
    }
    
    setPhase("signal-floor");
  };

  // Handle signal floor submission
  const handleSignalFloorSubmit = (signals: StructuredSignals) => {
    setStructuredSignals(signals);
    
    const signalText = serializeSignals(signals);
    const newHistory = signalText ? [...narrativeHistory, signalText] : [...narrativeHistory];
    setNarrativeHistory(newHistory);
    
    logChoice("before", "signal-floor", JSON.stringify(signals));
    
    const cumulativeText = newHistory.join("\n\n");
    const { riskResult: result, gapResult } = runSafetyClassification(cumulativeText);
    
    if (signals.timing === "already-happened" || signals.timing === "both") setDetectedTiming("after");
    else if (signals.timing === "deciding") setDetectedTiming("before");
    
    proceedWithSignals(cumulativeText, signals, result, gapResult);
  };

  // Handle signal floor skip
  const handleSignalFloorSkip = () => {
    logChoice("before", "signal-floor-skip", "skipped");
    const cumulativeText = getCumulativeText();
    const { riskResult: result, gapResult } = runSafetyClassification(cumulativeText);
    
    const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
    recordRun(result.level, hasFlaggedWords);
    
    const topMissing = getTopMissingSignal(structuredSignals);
    if (topMissing && result.level !== "red") {
      const clarificationGap: DetectedGap = getClarificationGap(topMissing);
      setGaps([clarificationGap]);
      setPhase("follow-up-questions");
      return;
    }
    
    if (result.level === "red" || result.level === "yellow") {
      setPhase("stop-moment");
      return;
    }
    
    fetchExplanation(cumulativeText, result.level, detectedTiming);
  };

  // Handle guided mode submission
  const handleGuidedSubmit = (text: string, signals: StructuredSignals) => {
    logFreetext("before", "guided-mode", text);
    setStructuredSignals(signals);
    
    const newHistory = [...narrativeHistory, text];
    setNarrativeHistory(newHistory);
    
    const cumulativeText = newHistory.join("\n\n");
    const { riskResult: result, gapResult } = runSafetyClassification(cumulativeText);
    
    if (signals.timing === "already-happened" || signals.timing === "both") setDetectedTiming("after");
    else if (signals.timing === "deciding") setDetectedTiming("before");
    
    proceedWithSignals(cumulativeText, signals, result, gapResult);
  };

  // Handle follow-up question answers
  const handleFollowUpAnswers = (answers: Record<string, string>) => {
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
      
      const cumulativeText = newHistory.join("\n\n");
      const { riskResult: result, gapResult } = runSafetyClassification(cumulativeText);
      
      const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
      recordRun(result.level, hasFlaggedWords);
      
      if (result.level === "red" || result.level === "yellow") {
        setPhase("stop-moment");
        return;
      }
      
      const effectiveTiming = resolveEffectiveTiming(structuredSignals, gapResult.detectedTiming);
      fetchExplanation(cumulativeText, result.level, effectiveTiming);
    } else {
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
    
    const effectiveTiming = resolveEffectiveTiming(structuredSignals, detectedTiming);
    fetchExplanation(cumulativeText, effectiveRisk, effectiveTiming);
  };

  // Handle stop moment acknowledgment
  const handleStopMomentAcknowledge = () => {
    const cumulativeText = getCumulativeText();
    const effectiveTiming = resolveEffectiveTiming(structuredSignals, detectedTiming);
    fetchExplanation(cumulativeText, riskHighWaterMark, effectiveTiming);
  };

  // Fetch AI explanation
  const fetchExplanation = async (text: string, riskLevel: RiskLevel, timing: "before" | "after" | "unclear") => {
    const isAfter = timing === "after";
    setPhase(isAfter ? "after-explanation" : "explanation");
    setIsLoading(true);
    setExplanationComplete(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-narrative`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            narrativeText: text,
            precomputedRiskLevel: riskLevel,
            detectedTiming: timing,
            isFollowUp: narrativeHistory.length > 1,
            structuredSignals,
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // === TEMPORARY DIAGNOSTICS ===
      console.log("[ITO-DIAG] Raw API response:", JSON.stringify(data));
      console.log("[ITO-DIAG] isAfter:", isAfter, "timing:", timing, "riskLevel:", riskLevel);
      console.log("[ITO-DIAG] data keys:", data ? Object.keys(data) : "null");
      console.log("[ITO-DIAG] signalLabel:", JSON.stringify(data?.signalLabel), "why:", JSON.stringify(data?.why), "suggestion:", JSON.stringify(data?.suggestion));
      // === END DIAGNOSTICS ===
      
      if (data?.error) throw new Error(data.error);

      const signalLabel = cleanText(data?.signalLabel) || "Check in with them";
      const why = cleanList(data?.why);
      const suggestion = cleanText(data?.suggestion);

      const clarityCheck = cleanText(data?.clarityCheck);
      const otherPersonPerspective = cleanText(data?.otherPersonPerspective);
      const yourPatterns = cleanText(data?.yourPatterns);
      const accountabilitySteps = cleanText(data?.accountabilitySteps);
      const avoidingRepetition = cleanText(data?.avoidingRepetition);

      console.log("[ITO-DIAG] Cleaned — signalLabel:", signalLabel, "why:", why, "suggestion:", suggestion, "clarityCheck:", clarityCheck);
      console.log("[ITO-DIAG] Phase:", isAfter ? "after-explanation" : "explanation", "isNeutralRisk:", riskLevel === "green");

      if (isAfter) {
        const afterObj = {
          clarityCheck: clarityCheck || "We can’t fully read this response right now, but it sounds like something important happened.",
          otherPersonPerspective: otherPersonPerspective || "The other person may have experienced this differently than you expected.",
          yourPatterns,
          accountabilitySteps: accountabilitySteps || "For now, pause and give them space while you reflect.",
          avoidingRepetition,
        };
        console.log("[ITO-DIAG] Setting afterAnalysis:", JSON.stringify(afterObj));
        setAfterAnalysis(afterObj);
      } else {
        const beforeObj = {
          riskLevel,
          signalLabel,
          why: why.length > 0 ? why : ["Something feels unclear here, so it’s best to pause and check in directly."],
          suggestion: suggestion || "Pause and ask them directly what they want right now.",
        };
        console.log("[ITO-DIAG] Setting analysis:", JSON.stringify(beforeObj));
        setAnalysis(beforeObj);
      }

      const fullResponse = isAfter
        ? `Risk: ${riskLevel} | ${clarityCheck || "fallback"} | ${accountabilitySteps || "fallback"}`
        : `Risk: ${riskLevel} - ${signalLabel} | Why: ${(why.length > 0 ? why : ["fallback"]).join("; ")} | Suggestion: ${suggestion || "fallback"}`;
      logAIResponse("before", "narrative-explanation", fullResponse);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("[ITO-DIAG] fetchExplanation error:", errMsg);

      const isRateLimit = errMsg?.includes("429") || errMsg?.toLowerCase().includes("rate limit") || errMsg?.toLowerCase().includes("too many");
      const userFacingMsg = isRateLimit
        ? "You’ve sent a few requests in a row — give it a minute and try again."
        : "We couldn’t check this right now. Try again in a moment.";

      if (isAfter) {
        setAfterAnalysis({
          clarityCheck: userFacingMsg,
          otherPersonPerspective: "",
          yourPatterns: "",
          accountabilitySteps: "When in doubt, slow down and check in with them directly.",
          avoidingRepetition: "",
        });
      } else {
        setAnalysis({
          riskLevel,
          signalLabel: isRateLimit ? "Slow down for a moment" : "Something went wrong",
          why: [userFacingMsg],
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

  // Follow-up chat
  const handleFollowUpSubmit = async (message: string) => {
    const userMessage = { role: "user" as const, content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const newHistory = [...narrativeHistory, message];
    setNarrativeHistory(newHistory);
    
    const cumulativeText = newHistory.join("\n\n");
    runSafetyClassification(cumulativeText);
    
    logFreetext("before", "follow-up", message);
    
    try {
      const followUpBody = {
        message,
        conversationHistory: chatMessages.slice(-12),
        initialContext: cumulativeText,
        riskLevel: riskHighWaterMark,
      };

      console.log("[ITO-DIAG] followup request body:", JSON.stringify(followUpBody).slice(0, 500));

      let followUpData: { response?: unknown } | null = null;
      let lastAttemptError: unknown = null;

      for (let attempt = 0; attempt <= MAX_FOLLOWUP_FETCH_RETRIES; attempt++) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ito-followup`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify(followUpBody),
            }
          );

          console.log("[ITO-DIAG] followup response status:", response.status, "attempt:", attempt + 1);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[ITO-DIAG] followup error body:", errorData);

            if (response.status === 429) {
              throw new Error("You're sending messages quickly. Please wait a few seconds and try again.");
            }
            if (response.status === 402) {
              throw new Error("AI credits are temporarily exhausted. Please try again later.");
            }
            throw new Error(
              typeof errorData?.error === "string"
                ? errorData.error
                : "The assistant couldn't respond right now. Please try again."
            );
          }

          followUpData = await response.json();
          console.log("[ITO-DIAG] followup response data:", JSON.stringify(followUpData).slice(0, 300));
          break;
        } catch (attemptError) {
          lastAttemptError = attemptError;

          const shouldRetry = isLikelyNetworkFetchError(attemptError) && attempt < MAX_FOLLOWUP_FETCH_RETRIES;
          if (!shouldRetry) {
            throw attemptError;
          }

          const retryDelay = FOLLOWUP_RETRY_BASE_DELAY_MS * (attempt + 1);
          console.warn(`[ITO-DIAG] followup network issue on attempt ${attempt + 1}. Retrying in ${retryDelay}ms.`);
          await sleep(retryDelay);
        }
      }

      if (!followUpData) {
        throw lastAttemptError instanceof Error
          ? lastAttemptError
          : new Error("The assistant couldn't respond right now. Please try again.");
      }

      const responseText = typeof followUpData?.response === "string" ? followUpData.response.trim() : "";

      if (!responseText) {
        throw new Error("The assistant returned an empty response. Please try again.");
      }

      const assistantMessage = { role: "assistant" as const, content: responseText };
      setChatMessages(prev => [...prev, assistantMessage]);
      logAIResponse("before", "follow-up-response", responseText);
    } catch (error) {
      console.error("Error in follow-up:", error);
      const userFacingError = isLikelyNetworkFetchError(error)
        ? "We hit a temporary connection issue. Please tap Send again in a few seconds."
        : error instanceof Error && error.message
          ? error.message
          : "I’m having trouble right now. Can you try again?";

      setChatMessages(prev => [...prev, {
        role: "assistant" as const,
        content: userFacingError
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
    setStructuredSignals({});
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

      <main className="flex-1 container mx-auto px-5 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {phase !== "narrative-input" && phase !== "guided-mode" ? (
            <BackButton label="Back" onClick={() => {
              if (phase === "signal-floor") setPhase("narrative-input");
              else if (phase === "follow-up-questions") setPhase("signal-floor");
              else if (phase === "stop-moment") setPhase("narrative-input");
              else if (phase === "explanation" || phase === "after-explanation") setPhase("signal-floor");
              else if (phase === "post-explanation-choice") setPhase(detectedTiming === "after" ? "after-explanation" : "explanation");
              else if (phase === "follow-up-chat") setPhase("post-explanation-choice");
              else if (phase === "outcome") setPhase("post-explanation-choice");
              else if (phase === "outcome-feedback") setPhase("outcome");
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
              compact={shouldShowPatternWarning}
            />
          )}

          {/* Phase 1b: Guided Mode */}
          {phase === "guided-mode" && (
            <GuidedMode
              onSubmit={handleGuidedSubmit}
              onBack={() => setPhase("narrative-input")}
              isLoading={isLoading}
            />
          )}

          {/* Phase 2: Signal Floor */}
          {phase === "signal-floor" && (
            <SignalFloor
              onSubmit={handleSignalFloorSubmit}
              onSkip={handleSignalFloorSkip}
              isLoading={isLoading}
              detectedTiming={detectedTiming}
            />
          )}

          {/* Phase 3: Adaptive Follow-Up Questions */}
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
    </div>
  );
};

// Helper: generate a clarification gap for the highest-priority missing signal
function getClarificationGap(missing: "timing" | "age" | "physical" | "intent"): DetectedGap {
  switch (missing) {
    case "timing":
      return {
        id: "timing-clarification",
        category: "clarification",
        question: "Quick question before I answer — did this already happen, or are you deciding what to do?",
        priority: 1,
        safetyRelevant: true,
      };
    case "age":
      return {
        id: "age-clarification",
        category: "age",
        question: "How old are you both, roughly? This helps me give better advice.",
        priority: 2,
        safetyRelevant: true,
      };
    case "physical":
      return {
        id: "physical-clarification",
        category: "clarification",
        question: "Has anything physical happened, or is this about something else?",
        priority: 3,
        safetyRelevant: true,
      };
    case "intent":
      return {
        id: "intent-clarification",
        category: "clarification",
        question: "What are you hoping to figure out?",
        priority: 4,
        safetyRelevant: false,
      };
  }
}

export default CheckIn;
