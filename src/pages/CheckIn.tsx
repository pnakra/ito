import { useState, useCallback, useEffect, useRef } from "react";
import { looksSelfInvolved } from "@/lib/witnessGuards";
import ConsentModal, { hasSessionConsent } from "@/components/ConsentModal";
import { useSearchParams, useNavigate } from "react-router-dom";
import { refreshReferralMeta } from "@/lib/referralMeta";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BackButton from "@/components/BackButton";
import NarrativeInput from "@/components/narrative/NarrativeInput";

import SignalFloor from "@/components/narrative/SignalFloor";
import AdaptiveFollowUp from "@/components/narrative/AdaptiveFollowUp";
import StopMoment from "@/components/prevention/StopMoment";
import AnimatedExplanationCard from "@/components/prevention/AnimatedExplanationCard";
import NeutralExplanationCard from "@/components/prevention/NeutralExplanationCard";
import PostExplanationChoice from "@/components/prevention/PostExplanationChoice";
import ConversationalChat from "@/components/prevention/ConversationalChat";
import SessionPatternWarning from "@/components/prevention/SessionPatternWarning";
import RefusalCard from "@/components/prevention/RefusalCard";
import AfterHandoff from "@/components/prevention/AfterHandoff";
import OutcomeCheck from "@/components/prevention/OutcomeCheck";
import ConfidencePost from "@/components/prevention/ConfidencePost";
import AgeConfidenceCheck, { type AgeConfidenceResult, type ExtraAgeQuestion } from "@/components/narrative/AgeConfidenceCheck";
import IntakeChoice from "@/components/narrative/IntakeChoice";
import OutcomeFeedback from "@/components/prevention/OutcomeFeedback";
import AfterExplanationCard from "@/components/after/AfterExplanationCard";
import { detectGaps, narrativeToDecisionState, detectSubmissionFlag, type DetectedGap } from "@/lib/narrativeGapDetection";
import { classifyRisk, detectFlagWords, formatSelectionsForAI } from "@/lib/riskClassification";
import { useSessionRiskTracking } from "@/hooks/useSessionRiskTracking";
import { logChoice, logFreetext, logAIResponse, logSubmission, resetSessionId } from "@/lib/submissionLogger";
import type { RiskLevel } from "@/types/risk";
import { type StructuredSignals, serializeSignals, getTopMissingSignal } from "@/types/signals";
import { invokeEdgeFunctionWithRetry, isLikelyTransientEdgeError } from "@/lib/invokeEdgeFunctionWithRetry";

type FlowPhase =
  | "narrative-input"
  | "role-question"
  | "group-part"
  | "witness-timing"
  | "age-check"
  | "signal-floor"
  | "follow-up-questions"
  | "stop-moment"
  | "explanation"
  | "after-explanation"
  | "post-explanation-choice"
  | "follow-up-chat"
  | "confidence-post"
  | "outcome"
  | "outcome-feedback"
  | "refusal"
  | "out-of-scope"
  | "crisis"
  | "distress"
  | "relational-lite";

interface AnalysisData {
  riskLevel: RiskLevel;
  signalLabel: string;
  why: string[];
  suggestion: string;
  followUpQuestion?: string;
}

interface AfterAnalysisData {
  clarityCheck: string;
  otherPersonPerspective: string;
  perspectiveDisclaimer?: string;
  accountabilitySteps: string;
  avoidingRepetition: string;
  yourPatterns: string;
  nextSteps?: string;
  followUpQuestion?: string;
}

const cleanText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const cleanList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
};

const MAX_FOLLOWUP_RETRIES = 5;

const CheckIn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Pick up ?src= etc. when reached by in-app navigation (e.g. from /bystanderbeta).
  useEffect(() => { refreshReferralMeta(); }, []);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingSubmitText, setPendingSubmitText] = useState<string | null>(null);
  // Entry method for the current submission ("typed" | "chip_unedited" | "chip_edited").
  // Held in a ref so it survives consent-modal interception and reaches the edge function.
  const entryMethodRef = useRef<"typed" | "chip_unedited" | "chip_edited">("typed");
  const pendingEntryMethodRef = useRef<"typed" | "chip_unedited" | "chip_edited">("typed");
  const [phase, setPhase] = useState<FlowPhase>("narrative-input");

  // External handoff: prefill the narrative textarea via ?situation= query param.
  // Read once on mount, then strip from URL so refresh doesn't overwrite edits.
  const [prefillSituation] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("situation");
    return raw ? raw.slice(0, 2000) : "";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("situation")) {
      params.delete("situation");
      const qs = params.toString();
      const newUrl = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);
  
  // Cumulative narrative context — NEVER reset, only append
  const [narrativeHistory, setNarrativeHistory] = useState<string[]>([]);
  
  // Structured signals collected from signal floor or guided mode
  const [structuredSignals, setStructuredSignals] = useState<StructuredSignals>({});
  
  // High-water-mark risk — can only stay same or increase
  const [riskHighWaterMark, setRiskHighWaterMark] = useState<RiskLevel>("green");
  const [riskResult, setRiskResult] = useState<{ level: RiskLevel; stopMessage: string; flaggedWords?: string[]; isCrisis?: boolean } | null>(null);
  
  // Flow routing
  const [detectedTiming, setDetectedTiming] = useState<"before" | "after" | "unclear">("unclear");
  // Ref stores the resolved timing synchronously so stop-moment acknowledge uses the correct value
  const resolvedTimingRef = useRef<"before" | "after" | "unclear">("unclear");
  // Ref stores structuredSignals synchronously for use in fetchExplanation
  const structuredSignalsRef = useRef<StructuredSignals>({});
  
  // Gap detection
  const [gaps, setGaps] = useState<DetectedGap[]>([]);
  
  // Analysis results
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [afterAnalysis, setAfterAnalysis] = useState<AfterAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanationComplete, setExplanationComplete] = useState(false);
  
  // Follow-up chat
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatClosed, setChatClosed] = useState(false);
  // Snapshot of the narrative as it stood when the chat began
  const preChatNarrativeRef = useRef<string>("");
  // Reporter role: preset via ?role=other (bystander entry point) or asked at the stop screen.
  const presetRole = (["self", "other", "unsure"] as const).find((r) => r === searchParams.get("role")) ?? null;
  const reporterRoleRef = useRef<"self" | "other" | "unsure" | null>(presetRole);
  // Logs the text-pattern self-involvement check at most once per flow.
  const selfInvolvementLoggedRef = useRef(false);
  const [reporterRole, setReporterRoleState] = useState<"self" | "other" | "unsure" | null>(presetRole);
  const setReporterRole = useCallback((r: "self" | "other" | "unsure" | null) => {
    reporterRoleRef.current = r;
    setReporterRoleState(r);
  }, []);
  const [witnessTiming, setWitnessTiming] = useState<"now" | "soon" | "already" | null>(null);
  // Group answer to "Where are you in it?" (only for "a group of us").
  const [groupPart, setGroupPart] = useState<"in" | "considering" | "watching" | null>(null);
  // Whether the witness card was shown in this flow (for the Back button).
  const [witnessCardShown, setWitnessCardShown] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [confidencePre, setConfidencePre] = useState<number | null>(null);
  const [confidencePost, setConfidencePost] = useState<number | null>(null);
  // Pending narrative held while the mandatory age-check micro-step runs
  const [pendingAgeCheckText, setPendingAgeCheckText] = useState<string | null>(null);
  
  // Session tracking
  const {
    shouldShowPatternWarning,
    recordRun: recordRunRaw,
    coercivePatternCount,
    yellowOrRedCount,
  } = useSessionRiskTracking();

  // Only "self" runs count toward session risk tracking.
  const recordRun = useCallback((level: RiskLevel, flagged: boolean) => {
    if (reporterRoleRef.current !== "self") return;
    recordRunRaw(level, flagged);
  }, [recordRunRaw]);

  // Self-involvement text check is log-only now: the AI backstop
  // (userTookPart / witnessDropped) handles people who actually took part,
  // and a text-pattern misfire used to send real witnesses to the wrong screen.
  const applySelfInvolvementGuard = useCallback((text: string) => {
    if (reporterRoleRef.current === "other" && looksSelfInvolved(text)) {
      if (selfInvolvementLoggedRef.current) return;
      selfInvolvementLoggedRef.current = true;
      logSubmission({ flowType: "before", stepName: "reporter-role-check", stepType: "choice", choiceValue: "possible_self_involvement", metadata: { picked: "other" } });
    }
  }, []);

  const applyAiOverride = useCallback((reason: "ai_user_took_part" | "ai_witness_dropped") => {
    if (reporterRoleRef.current === "self") return;
    setReporterRole("self");
    logSubmission({ flowType: "before", stepName: "reporter-role-override", stepType: "choice", choiceValue: "self", metadata: { reason } });
  }, [setReporterRole]);

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
        // Log demo session the same way a normal session would
        logFreetext("before", "narrative-input", narrative || "");
        logSubmission({
          flowType: "before",
          stepName: "narrative-input-entry",
          stepType: "choice",
          metadata: { entry_method: "demo", source_type: "demo" },
        });
        logChoice("before", "signal-floor", JSON.stringify({ ...signals, _demo: true }));
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
    riskResult: { level: RiskLevel; stopMessage: string; flaggedWords?: string[]; isCrisis?: boolean },
    gapResult: ReturnType<typeof detectGaps>
  ) => {
    const hasFlaggedWords = (riskResult.flaggedWords?.length ?? 0) > 0;

// Out-of-scope: skip the full flow, show redirect
    if (gapResult.queryType === "out-of-scope") {
      setPhase("out-of-scope");
      return;
    }

    if (gapResult.queryType === "crisis") {
      logSubmission({ flowType: "before", stepName: "crisis-redirect", stepType: "choice", metadata: { flag: "crisis" } });
      setPhase("crisis");
      return;
    }

    if (gapResult.queryType === "distress") {
      logSubmission({ flowType: "before", stepName: "distress-redirect", stepType: "choice", metadata: { flag: "distress" } });
      setPhase("distress");
      return;
    }

    // Relational: not a consent encounter, skip follow-up questions entirely
    if (gapResult.queryType === "relational") {
      recordRun(riskResult.level, hasFlaggedWords);
      resolvedTimingRef.current = resolveEffectiveTiming(signals, gapResult.detectedTiming);
      fetchExplanation(cumulativeText, riskResult.level, resolvedTimingRef.current);
      return;
    }
    
    applySelfInvolvementGuard(cumulativeText);
    if (riskResult.level === "red" && hasFlaggedWords && coercivePatternCount >= 1 && reporterRoleRef.current === "self") {
      recordRun(riskResult.level, hasFlaggedWords);
      setPhase("refusal");
      return;
    }
    
    recordRun(riskResult.level, hasFlaggedWords);
    
    // Resolve and lock timing immediately — all downstream paths read from ref, not state
    resolvedTimingRef.current = resolveEffectiveTiming(signals, gapResult.detectedTiming);
    
    const remainingGaps = gapResult.gaps.filter(gap => {
      if (gap.id === "timing" && signals.timing) return false;
      if (gap.id === "age" && (signals.ageUser || signals.ageOther)) return false;
      return true;
    });

    // For "both" timing, substances is always safety-critical regardless of hasMinimumSafetyContext
    // A "said yes but something felt off" situation reads very differently if drinking was involved
    const isBothFlow = signals.timing === "both";
    const substancesGapPresent = remainingGaps.some(g => g.id === "substances");
    const hasMinimumContext = gapResult.hasMinimumSafetyContext && !(isBothFlow && substancesGapPresent);

    if (remainingGaps.length > 0 && !hasMinimumContext && riskResult.level !== "red") {
      // For both flow, only surface the substances gap if that's the only thing missing
      const gapsToAsk = isBothFlow && substancesGapPresent
        ? remainingGaps.filter(g => g.id === "substances")
        : remainingGaps;
      setGaps(gapsToAsk);
      setPhase("follow-up-questions");
      return;
    }
    
    if (riskResult.level === "red" || riskResult.level === "yellow") {
      setPhase("stop-moment");
      return;
    }

    fetchExplanation(cumulativeText, riskResult.level, resolvedTimingRef.current);
  }, [coercivePatternCount, recordRun, resolveEffectiveTiming, applySelfInvolvementGuard]);

  // Handle initial narrative submission — go to signal floor
  const handleNarrativeSubmit = (text: string, entryMethod: "typed" | "chip_unedited" | "chip_edited" = "typed") => {
    // If user hasn't consented yet this session, show the modal first
    if (!hasSessionConsent()) {
      setPendingSubmitText(text);
      pendingEntryMethodRef.current = entryMethod;
      setShowConsentModal(true);
      return;
    }
    startIntake(text, entryMethod);
  };

  const updateSignals = (patch: Partial<StructuredSignals>) => {
    const next: StructuredSignals = { ...structuredSignalsRef.current, ...patch };
    structuredSignalsRef.current = next;
    setStructuredSignals(next);
  };

  // Intake starts with "who is this about", unless the role is preset to other (/witness).
  const startIntake = (text: string, entryMethod: "typed" | "chip_unedited" | "chip_edited") => {
    entryMethodRef.current = entryMethod;
    setPendingAgeCheckText(text);
    if (presetRole === "other") {
      setReporterRole("other");
      setPhase("witness-timing");
    } else {
      setPhase("role-question");
    }
  };

  const handleRoleQuestion = (picked: "self" | "other" | "group") => {
    logSubmission({ flowType: "before", stepName: "reporter-role", stepType: "choice", choiceValue: picked, metadata: { role: picked } });
    if (picked === "group") {
      updateSignals({ group: true });
      setPhase("group-part");
      return;
    }
    setGroupPart(null);
    const { group: _g, groupPart: _gp, ...rest } = structuredSignalsRef.current;
    structuredSignalsRef.current = rest;
    setStructuredSignals(rest);
    setReporterRole(picked);
    setPhase(picked === "other" ? "witness-timing" : "age-check");
  };

  const handleGroupPart = (part: "in" | "considering" | "watching") => {
    logSubmission({ flowType: "before", stepName: "group-part", stepType: "choice", choiceValue: part, metadata: { groupPart: part } });
    setGroupPart(part);
    updateSignals({ group: true, groupPart: part });
    const role = part === "watching" ? "other" : "self";
    setReporterRole(role);
    setPhase(role === "other" ? "witness-timing" : "age-check");
  };

  const handleWitnessTiming = (t: "now" | "soon" | "already") => {
    setWitnessTiming(t);
    logSubmission({ flowType: "before", stepName: "witness-timing", stepType: "choice", choiceValue: t, metadata: { witnessTiming: t } });
    const { timing: _t, ...rest } = structuredSignalsRef.current;
    const next: StructuredSignals = { ...rest, witnessTiming: t };
    if (t === "already") next.timing = "already-happened";
    resolvedTimingRef.current = t === "already" ? "after" : "before";
    structuredSignalsRef.current = next;
    setStructuredSignals(next);
    if (t === "now") {
      // Happening right now: ask nothing else.
      const text = pendingAgeCheckText ?? "";
      setPendingAgeCheckText(null);
      if (text) processNarrativeSubmit(text, entryMethodRef.current);
      else setPhase("narrative-input");
      return;
    }
    setPhase("age-check");
  };

  const extraAgeQuestions: ExtraAgeQuestion[] =
    groupPart !== null
      ? [
          { key: "ageGroup", question: "How old are most of the group?" },
          { key: "ageOtherPerson", question: "How old is the other person?" },
        ]
      : reporterRole === "other"
        ? [
            { key: "agePersonCrossing", question: "How old is the person who might be crossing a line?" },
            { key: "ageOtherPerson", question: "How old is the other person?" },
          ]
        : [];

  const EXTRA_AGE_STEP: Record<string, string> = {
    agePersonCrossing: "age-person-crossing",
    ageOtherPerson: "age-other-person",
    ageGroup: "age-group",
  };

  const handleAgeCheckSubmit = ({ ageUser, confidencePre, extraAges }: AgeConfidenceResult) => {
    setConfidencePre(confidencePre);
    logChoice("before", "age-check", ageUser);
    const agePatch: Partial<StructuredSignals> = {};
    for (const q of extraAgeQuestions) {
      const v = extraAges[q.key];
      if (!v) continue;
      logChoice("before", EXTRA_AGE_STEP[q.key], v);
      agePatch[q.key] = v;
    }
    if (Object.keys(agePatch).length > 0) updateSignals(agePatch);
    logSubmission({
      flowType: "before",
      stepName: "confidence-pre",
      stepType: "choice",
      choiceValue: confidencePre != null ? String(confidencePre) : "not-answered",
      metadata: { scale: "1-5" },
    });

    if (ageUser && ageUser !== "prefer-not-to-say") {
      setStructuredSignals(prev => {
        const next = { ...prev, ageUser };
        structuredSignalsRef.current = next;
        return next;
      });
    }

    const text = pendingAgeCheckText ?? "";
    setPendingAgeCheckText(null);
    if (text) processNarrativeSubmit(text, entryMethodRef.current);
    else setPhase("narrative-input");
  };

  const processNarrativeSubmit = (text: string, entryMethod: "typed" | "chip_unedited" | "chip_edited" = "typed") => {
    entryMethodRef.current = entryMethod;
    logFreetext("before", "narrative-input", text);

    // Always log entry method on the first narrative submission so we can
    // measure chip_unedited vs chip_edited vs typed conversion downstream.
    logSubmission({
      flowType: "before",
      stepName: "narrative-input-entry",
      stepType: "choice",
      metadata: { entry_method: entryMethod, source_type: entryMethod },
    });

    // Flag victim/perpetrator submissions for monitoring (no behavior change)
    const submissionFlag = detectSubmissionFlag(text);
    if (submissionFlag) {
      logSubmission({ flowType: "before", stepName: "narrative-input", stepType: "freetext", freetextValue: text, metadata: { flag: submissionFlag, entry_method: entryMethod } });
    }
    
    const newHistory = [...narrativeHistory, text];
    setNarrativeHistory(newHistory);
    
    const cumulativeText = newHistory.join("\n\n");
    const { riskResult: result, gapResult } = runSafetyClassification(cumulativeText);
    
    const hasFlaggedWords = (result.flaggedWords?.length ?? 0) > 0;
    applySelfInvolvementGuard(cumulativeText);
    
    if (result.level === "red" && hasFlaggedWords && coercivePatternCount >= 1 && reporterRoleRef.current === "self") {
      recordRun(result.level, hasFlaggedWords);
      setPhase("refusal");
      return;
    }
    
    if (result.level === "red") {
      recordRun(result.level, hasFlaggedWords);
      if (reporterRoleRef.current === "other") {
        setDetectedTiming(resolvedTimingRef.current);
        setWitnessCardShown(true);
      }
      setPhase("stop-moment");
      return;
    }

    if (gapResult.queryType === "crisis") {
      logSubmission({ flowType: "before", stepName: "crisis-redirect", stepType: "choice", metadata: { flag: "crisis", narrative: text.slice(0, 200) } });
      setPhase("crisis");
      return;
    }

    // Witnesses skip the actor-shaped screens. Timing was already asked
    // ("When is this?"). The card shows only for "now" (or red, above).
    if (reporterRoleRef.current === "other") {
      setDetectedTiming(resolvedTimingRef.current);
      if (structuredSignalsRef.current.witnessTiming === "now") {
        setWitnessCardShown(true);
        setPhase("stop-moment");
      } else {
        fetchExplanation(cumulativeText, result.level, resolvedTimingRef.current);
      }
      return;
    }

    if (gapResult.queryType === "distress") {
      logSubmission({ flowType: "before", stepName: "distress-redirect", stepType: "choice", metadata: { flag: "distress", narrative: text.slice(0, 200) } });
      setPhase("distress");
      return;
    }

    if (gapResult.queryType === "out-of-scope") {
      setPhase("out-of-scope");
      return;
    }

    if (gapResult.queryType === "relational-lite") {
      recordRun(result.level, hasFlaggedWords);
      fetchExplanation(cumulativeText, result.level, resolvedTimingRef.current);
      return;
    }

    if (gapResult.queryType === "relational") {
      recordRun(result.level, hasFlaggedWords);
      fetchExplanation(cumulativeText, result.level, resolvedTimingRef.current);
      return;
    }
    
    setPhase("signal-floor");
  };

  const handleConsentConfirm = () => {
    setShowConsentModal(false);
    if (pendingSubmitText) {
      startIntake(pendingSubmitText, pendingEntryMethodRef.current);
      setPendingSubmitText(null);
    }
  };

  const handleConsentCancel = () => {
    setShowConsentModal(false);
    setPendingSubmitText(null);
  };

  // Handle signal floor submission
  const handleSignalFloorSubmit = (incoming: StructuredSignals) => {
    // Preserve intake answers (age, group, extra ages) captured before the signal floor
    const prev = structuredSignalsRef.current;
    const signals: StructuredSignals = {
      ...(prev.ageUser ? { ageUser: prev.ageUser } : {}),
      ...(prev.group ? { group: prev.group } : {}),
      ...(prev.groupPart ? { groupPart: prev.groupPart } : {}),
      ...(prev.ageGroup ? { ageGroup: prev.ageGroup } : {}),
      ...(prev.ageOtherPerson ? { ageOtherPerson: prev.ageOtherPerson } : {}),
      ...(prev.agePersonCrossing ? { agePersonCrossing: prev.agePersonCrossing } : {}),
      ...incoming,
    };
    setStructuredSignals(signals);
    structuredSignalsRef.current = signals;
    
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
    
    fetchExplanation(cumulativeText, result.level, resolvedTimingRef.current);
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
      
      fetchExplanation(cumulativeText, result.level, resolvedTimingRef.current);
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
    
    fetchExplanation(cumulativeText, effectiveRisk, resolvedTimingRef.current);
  };

  // Handle stop moment acknowledgment
  const handleStopMomentAcknowledge = () => {
    const cumulativeText = getCumulativeText();
    fetchExplanation(cumulativeText, riskHighWaterMark, resolvedTimingRef.current);
  };

  // Fetch AI explanation
  const fetchExplanation = async (text: string, riskLevel: RiskLevel, timing: "before" | "after" | "unclear") => {
    applySelfInvolvementGuard(text);
    const isAfter = timing === "after";
    setPhase(isAfter ? "after-explanation" : "explanation");
    setIsLoading(true);
    setExplanationComplete(false);

    try {
      const data = await invokeEdgeFunctionWithRetry<Record<string, unknown>>(
        "analyze-narrative",
        {
          narrativeText: text,
          precomputedRiskLevel: riskLevel,
          detectedTiming: timing,
          isFollowUp: narrativeHistory.length > 1,
          structuredSignals: structuredSignalsRef.current,
          entryMethod: entryMethodRef.current,
          reporterRole: reporterRoleRef.current,
        },
        {
          maxRetries: 3,
          baseDelayMs: 600,
          label: "analyze-narrative",
        },
      );
      
      // === TEMPORARY DIAGNOSTICS ===
      console.log("[ITO-DIAG] Raw API response:", JSON.stringify(data));
      console.log("[ITO-DIAG] isAfter:", isAfter, "timing:", timing, "riskLevel:", riskLevel);
      console.log("[ITO-DIAG] data keys:", data ? Object.keys(data) : "null");
      console.log("[ITO-DIAG] signalLabel:", JSON.stringify(data?.signalLabel), "why:", JSON.stringify(data?.why), "suggestion:", JSON.stringify(data?.suggestion));
      // === END DIAGNOSTICS ===
      
      if (typeof data?.error === "string") throw new Error(data.error);
      if (data?.userTookPart === true) applyAiOverride("ai_user_took_part");

      const signalLabel = cleanText(data?.signalLabel) || "Check in with them";
      const why = cleanList(data?.why);
      const suggestion = cleanText(data?.suggestion);
      const followUpQuestion = cleanText(data?.followUpQuestion);

      const clarityCheck = cleanText(data?.clarityCheck);
      const otherPersonPerspective = cleanText(data?.otherPersonPerspective);
      const yourPatterns = cleanText(data?.yourPatterns);
      const accountabilitySteps = cleanText(data?.accountabilitySteps);
      const avoidingRepetition = cleanText(data?.avoidingRepetition);
      const nextSteps = cleanText(data?.nextSteps);

      console.log("[ITO-DIAG] Cleaned — signalLabel:", signalLabel, "why:", why, "suggestion:", suggestion, "clarityCheck:", clarityCheck, "followUpQuestion:", followUpQuestion);
      console.log("[ITO-DIAG] Phase:", isAfter ? "after-explanation" : "explanation", "isNeutralRisk:", riskLevel === "green");

      if (isAfter) {
        const afterObj = {
          clarityCheck: clarityCheck || "We can’t fully read this response right now, but it sounds like something important happened.",
          otherPersonPerspective: otherPersonPerspective || "The other person may have experienced this differently than you expected.",
          yourPatterns,
          accountabilitySteps: accountabilitySteps || "For now, pause and give them space while you reflect.",
          avoidingRepetition,
          ...(nextSteps ? { nextSteps } : {}),
          ...(followUpQuestion ? { followUpQuestion } : {}),
        };
        console.log("[ITO-DIAG] Setting afterAnalysis:", JSON.stringify(afterObj));
        setAfterAnalysis(afterObj);
      } else {
        const beforeObj = {
          riskLevel,
          signalLabel,
          why: why.length > 0 ? why : ["Something feels unclear here, so it’s best to pause and check in directly."],
          suggestion: suggestion || "Pause and ask them directly what they want right now.",
          ...(followUpQuestion ? { followUpQuestion } : {}),
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
        : "Ito can’t check this right now. If something feels urgent, don’t wait on a tool — talk to a person you trust, or reach out: RAINN 800-656-4673, Crisis Text Line text HOME to 741741, or 988.";

      if (isAfter) {
        setAfterAnalysis({
          clarityCheck: userFacingMsg,
          otherPersonPerspective: "",
          yourPatterns: "",
          accountabilitySteps: "When in doubt, slow down. If you need to talk to someone now, the resources above are available 24/7.",
          avoidingRepetition: "",
        });
      } else {
        setAnalysis({
          riskLevel,
          signalLabel: isRateLimit ? "Slow down for a moment" : "Ito is offline right now",
          why: [userFacingMsg],
          suggestion: "When in doubt, slow down and check in verbally. Don’t rely on a tool to make this call for you.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Post-explanation choices
  const handlePostExplanationDone = () => setPhase("confidence-post");
  
  const handlePostExplanationContinue = () => {
    setChatMessages([]);
    preChatNarrativeRef.current = narrativeHistory.join("\n\n");
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
        conversationHistory: chatMessages,
        initialContext: preChatNarrativeRef.current,
        structuredSignals: structuredSignalsRef.current,
        riskLevel: riskHighWaterMark,
        reporterRole: reporterRoleRef.current,
      };

      console.log("[ITO-DIAG] followup request body:", JSON.stringify(followUpBody).slice(0, 500));

      const followUpData = await invokeEdgeFunctionWithRetry<{ response?: unknown; closed?: boolean; strikes?: number; closeReason?: string; witness?: boolean; witnessDropped?: boolean }>(
        "ito-followup",
        followUpBody,
        {
          maxRetries: MAX_FOLLOWUP_RETRIES,
          baseDelayMs: 900,
          label: "ito-followup",
        },
      );

      console.log("[ITO-DIAG] followup response data:", JSON.stringify(followUpData).slice(0, 300));

      if (followUpData?.witnessDropped === true) applyAiOverride("ai_witness_dropped");

      if (followUpData?.closed === true) {
        setChatClosed(true);
        logSubmission({
          flowType: "before",
          stepName: "chat-closed",
          stepType: "choice",
          choiceValue: "closed-adversarial",
          metadata: { strikes: followUpData?.strikes ?? null, close_reason: followUpData?.closeReason ?? null },
        });
      }

      const responseText = typeof followUpData?.response === "string" ? followUpData.response.trim() : "";

      if (!responseText) {
        throw new Error("Empty response. Try again.");
      }

      const assistantMessage = { role: "assistant" as const, content: responseText };
      setChatMessages(prev => [...prev, assistantMessage]);
      logAIResponse("before", "follow-up-response", responseText);
    } catch (error) {
      console.error("Error in follow-up:", error);
      const userFacingError = isLikelyTransientEdgeError(error)
        ? "Connection issue. Tap Send again in a few seconds."
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

  const handleFollowUpDone = () =>
    setPhase(confidencePost === null ? "confidence-post" : "outcome");

  const handleOutcomeSelect = (outcome: string) => {
    if (selectedOutcome) return;
    setSelectedOutcome(outcome);
    if (reporterRoleRef.current === "other") {
      logSubmission({ flowType: "before", stepName: "outcome", stepType: "choice", choiceValue: outcome, metadata: { role: "other" } });
    } else {
      logChoice("before", "outcome", outcome);
    }
    if (phase === "outcome") setPhase("outcome-feedback");
  };

  const handleConfidencePost = (value: number) => {
    setConfidencePost(value);
    logSubmission({
      flowType: "before",
      stepName: "confidence-post",
      stepType: "choice",
      choiceValue: String(value),
      metadata: { scale: "1-5" },
    });
    setPhase("outcome");
  };

  const resetFlow = () => {
    setPhase("narrative-input");
    setNarrativeHistory([]);
    setStructuredSignals({});
    setRiskHighWaterMark("green");
    setRiskResult(null);
    setDetectedTiming("unclear");
    resolvedTimingRef.current = "unclear";
    structuredSignalsRef.current = {};
    setGaps([]);
    setAnalysis(null);
    setAfterAnalysis(null);
    setIsLoading(false);
    setExplanationComplete(false);
    setChatMessages([]);
    setChatClosed(false);
    preChatNarrativeRef.current = "";
    setSelectedOutcome(null);
    setConfidencePre(null);
    setConfidencePost(null);
    setPendingAgeCheckText(null);
    setReporterRole(presetRole);
    setWitnessTiming(null);
    setGroupPart(null);
    setWitnessCardShown(false);
    selfInvolvementLoggedRef.current = false;
    resetSessionId();
  };

  const isNeutralRisk = riskHighWaterMark === "green";
  const readText = [
    analysis?.signalLabel, ...(analysis?.why ?? []), analysis?.suggestion, analysis?.followUpQuestion,
    afterAnalysis?.clarityCheck, afterAnalysis?.otherPersonPerspective, afterAnalysis?.accountabilitySteps,
    afterAnalysis?.avoidingRepetition, afterAnalysis?.yourPatterns, afterAnalysis?.nextSteps, afterAnalysis?.followUpQuestion,
  ].filter(Boolean).join(" ");
  const showWitness911 = reporterRole === "other" && (riskHighWaterMark === "red" || readText.includes("911"));
  const shouldShowAfterHandoff = yellowOrRedCount >= 2;


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Check in — Get an honest read | ito"
        description="Write what's happening, or answer a few questions. ito gives you a thoughtful, non-judgmental read. Anonymous, nothing saved that identifies you."
        path="/check-in"
      />
      <Header />
      {showConsentModal && (
        <ConsentModal onConfirm={handleConsentConfirm} onCancel={handleConsentCancel} />
      )}

      <main className="flex-1 container mx-auto px-5 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {phase !== "narrative-input" ? (
            <BackButton label="Back" onClick={() => {
              if (phase === "role-question") setPhase("narrative-input");
              else if (phase === "group-part") setPhase("role-question");
              else if (phase === "witness-timing") setPhase(groupPart === "watching" ? "group-part" : presetRole === "other" ? "narrative-input" : "role-question");
              else if (phase === "age-check") setPhase(reporterRole === "other" ? "witness-timing" : groupPart !== null ? "group-part" : "role-question");
              else if (phase === "signal-floor") setPhase("narrative-input");
              else if (phase === "follow-up-questions") setPhase("signal-floor");
              else if (phase === "stop-moment") setPhase("narrative-input");
              else if (phase === "explanation" || phase === "after-explanation") {
                if (reporterRoleRef.current === "other") {
                  setPhase(witnessCardShown && riskResult ? "stop-moment" : "narrative-input");
                } else {
                  setPhase("signal-floor");
                }
              }
              else if (phase === "post-explanation-choice") setPhase(detectedTiming === "after" ? "after-explanation" : "explanation");
              else if (phase === "follow-up-chat") setPhase(detectedTiming === "after" ? "after-explanation" : "explanation");
              else if (phase === "confidence-post") setPhase(detectedTiming === "after" ? "after-explanation" : "explanation");
              else if (phase === "outcome") setPhase("confidence-post");
              else if (phase === "outcome-feedback") setPhase("outcome");
              else resetFlow();
            }} />
          ) : (
            <BackButton to="/" />
          )}

          {showWitness911 &&
            (phase === "explanation" || phase === "after-explanation" || phase === "follow-up-chat") && (
            <div className="space-y-1">
              <a href="tel:911" className="flex items-center justify-center w-full py-3 rounded-lg border border-signal-stop/20 text-signal-stop text-[14px] font-medium hover:bg-signal-stop/5 transition-colors">Call 911</a>
              <p className="text-[12px] text-muted-foreground text-center">If someone is passed out, can't respond, or is in danger, call 911.</p>
            </div>
          )}

          {shouldShowPatternWarning && phase === "narrative-input" && (
            <SessionPatternWarning />
          )}

          {/* Phase 1: Narrative Input */}
          {phase === "narrative-input" && (
            <>
              <NarrativeInput
                onSubmit={handleNarrativeSubmit}
                isLoading={isLoading}
                compact={shouldShowPatternWarning}
                initialValue={prefillSituation}
                hideSuggestions={!!prefillSituation}
              />
              {/* <PreviewIntroModal /> is paused for this flow cleanup. */}
            </>
          )}


          {phase === "role-question" && (
            <IntakeChoice
              heading="Are you asking about a personal situation, or something you're observing?"
              options={[
                { value: "self", label: "This is about me" },
                { value: "other", label: "This is about someone else" },
                { value: "group", label: "This is about a group of us" },
              ]}
              note="Asking so ito gets this right."
              onSelect={handleRoleQuestion}
            />
          )}

          {phase === "group-part" && (
            <IntakeChoice
              heading="Where are you in it?"
              options={[
                { value: "in", label: "I'm part of it" },
                { value: "considering", label: "I'm thinking about joining in" },
                { value: "watching", label: "I'm seeing or hearing about it" },
              ]}
              onSelect={handleGroupPart}
            />
          )}

          {phase === "witness-timing" && (
            <IntakeChoice
              heading="When is this?"
              options={[
                { value: "now", label: "Happening right now" },
                { value: "soon", label: "It might happen soon" },
                { value: "already", label: "It already happened" },
              ]}
              onSelect={handleWitnessTiming}
            />
          )}

          {/* Phase 1b: Mandatory age + pre-confidence check */}
          {phase === "age-check" && (
            <AgeConfidenceCheck
              key={`${reporterRole}-${groupPart}`}
              onSubmit={handleAgeCheckSubmit}
              isLoading={isLoading}
              extraAgeQuestions={extraAgeQuestions}
            />
          )}

          {/* Phase 2: Signal Floor */}
          {phase === "signal-floor" && (
            <SignalFloor
              onSubmit={handleSignalFloorSubmit}
              onSkip={handleSignalFloorSkip}
              isLoading={isLoading}
              detectedTiming={detectedTiming}
              initialAgeOther={
                structuredSignals.ageOtherPerson && structuredSignals.ageOtherPerson !== "not-sure"
                  ? structuredSignals.ageOtherPerson
                  : undefined
              }
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
              isCrisis={riskResult.isCrisis}
              role={reporterRole}
              witnessTiming={witnessTiming}
            />
          )}

          {/* Refusal */}
          {phase === "refusal" && (
            <RefusalCard onReset={resetFlow} />
          )}

          {/* Out of Scope */}
          {phase === "out-of-scope" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <p className="text-base font-medium text-foreground">
                This one might be outside what ito does best.
              </p>
              <p className="text-sm text-muted-foreground">
                ito is built for thinking through situations with another person — consent, boundaries, and how you both feel. What you described sounds more like a different kind of question.
              </p>
              <p className="text-sm text-muted-foreground">
                If something is going on that you want to talk through, a trusted adult, school counselor, or one of these resources might be a better fit:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-none">
                <li><a href="https://www.loveisrespect.org" target="_blank" rel="noopener noreferrer" className="underline">loveisrespect.org</a> — relationship questions, texting support</li>
                <li><a href="https://crisistextline.org" target="_blank" rel="noopener noreferrer" className="underline">Crisis Text Line</a> — text HOME to 741741</li>
                <li><a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="underline">988 Lifeline</a> — call or text 988</li>
              </ul>
              <button
                onClick={resetFlow}
                className="text-sm underline text-muted-foreground hover:text-foreground transition-colors"
              >
                Try a different question
              </button>
            </div>
          )}

          {/* Crisis */}
          {phase === "crisis" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <p className="text-base font-medium text-foreground">
                That sounds really heavy.
              </p>
              <p className="text-sm text-muted-foreground">
                ito is built for thinking through confusing dating and sexual situations — it's not the right tool for what you're going through right now. You deserve real support.
              </p>
              <p className="text-sm text-muted-foreground">
                If you're in a hard place, please reach out:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-none">
                <li><a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="underline">988 Suicide and Crisis Lifeline</a> — call or text 988, available 24/7</li>
                <li><a href="https://crisistextline.org" target="_blank" rel="noopener noreferrer" className="underline">Crisis Text Line</a> — text HOME to 741741</li>
              </ul>
              <button
                onClick={resetFlow}
                className="text-sm underline text-muted-foreground hover:text-foreground transition-colors"
              >
                Try a different question
              </button>
            </div>
          )}

          {/* Distress */}
          {phase === "distress" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <p className="text-base font-medium text-foreground">
                That feeling is real.
              </p>
              <p className="text-sm text-muted-foreground">
                ito is built for thinking through confusing dating and sexual situations — it's not the right fit for what you're going through right now. If things feel heavy, talking to someone can help more than this tool can.
              </p>
              <p className="text-sm text-muted-foreground">
                A school counselor, a trusted adult, or a warmline are good places to start. You can also reach the 988 Lifeline anytime by calling or texting 988.
              </p>
              <button
                onClick={resetFlow}
                className="text-sm underline text-muted-foreground hover:text-foreground transition-colors"
              >
                Try a different question
              </button>
            </div>
          )}
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
                reporterRole={reporterRole}
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


          {/* Post-explanation choice */}
          {(phase === "explanation" || phase === "after-explanation") &&
            !isLoading &&
            explanationComplete && (
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
            riskLevel={riskHighWaterMark}
            isClosed={chatClosed}
            reporterRole={reporterRole}
          />

          {phase === "confidence-post" && (
            <ConfidencePost
              onSelect={handleConfidencePost}
              onSkip={() => setPhase("outcome")}
              confidencePre={confidencePre}
            />
          )}

          {/* Outcome */}
          {phase === "outcome" && (
            <OutcomeCheck onSelect={handleOutcomeSelect} witness={reporterRole === "other"} />
          )}

          {phase === "outcome-feedback" && selectedOutcome && (
            <OutcomeFeedback
              outcomeId={selectedOutcome}
              feedbackKey={
                reporterRole === "other" && selectedOutcome === "prefer-not-to-say"
                  ? "witness-prefer-not-to-say"
                  : undefined
              }
              onReset={resetFlow}
              onTip={
                reporterRole === "other" && witnessTiming !== "now"
                  ? () => navigate("/witness/tip", { state: { story: narrativeHistory.join("\n\n") } })
                  : undefined
              }
            />
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
        question: "Quick question — did this already happen, or are you deciding what to do?",
        priority: 1,
        safetyRelevant: true,
      };
    case "age":
      return {
        id: "age-clarification",
        category: "age",
        question: "How old are you both, roughly?",
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
