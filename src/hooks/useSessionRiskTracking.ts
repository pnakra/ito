import { useState, useCallback, useRef } from "react";
import type { RiskLevel } from "@/types/risk";

interface SessionRiskState {
  runCount: number;
  yellowOrRedCount: number;
  coercivePatternCount: number;
}

const SESSION_KEY = "ito_session_risk";

// Get initial state from sessionStorage (survives refreshes within session)
function getInitialState(): SessionRiskState {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors, use default
  }
  return { runCount: 0, yellowOrRedCount: 0, coercivePatternCount: 0 };
}

export function useSessionRiskTracking() {
  const [state, setState] = useState<SessionRiskState>(getInitialState);

  const prevStateRef = useRef<SessionRiskState | null>(null);

  const recordRun = useCallback((riskLevel: RiskLevel, hadFlaggedWords: boolean) => {
    setState((prev) => {
      prevStateRef.current = prev;
      const updated = {
        runCount: prev.runCount + 1,
        yellowOrRedCount:
          riskLevel === "yellow" || riskLevel === "red"
            ? prev.yellowOrRedCount + 1
            : prev.yellowOrRedCount,
        coercivePatternCount: hadFlaggedWords
          ? prev.coercivePatternCount + 1
          : prev.coercivePatternCount,
      };
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  // Undo the most recent recordRun (e.g. once a submission turns out to be a witness report).
  const undoLastRun = useCallback(() => {
    const prev = prevStateRef.current;
    if (!prev) return;
    prevStateRef.current = null;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(prev));
    } catch {
      // Ignore storage errors
    }
    setState(prev);
  }, []);

  const shouldShowPatternWarning = state.yellowOrRedCount >= 2;
  
  const shouldRefuse = state.coercivePatternCount >= 2;

  return {
    runCount: state.runCount,
    yellowOrRedCount: state.yellowOrRedCount,
    coercivePatternCount: state.coercivePatternCount,
    shouldShowPatternWarning,
    shouldRefuse,
    recordRun,
    undoLastRun,
  };
}
