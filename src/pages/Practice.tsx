import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeEdgeFunctionWithRetry } from "@/lib/invokeEdgeFunctionWithRetry";
import { logSubmission, resetSessionId } from "@/lib/submissionLogger";
import PracticeGate, { PracticeUnder18 } from "@/components/practice/PracticeGate";
import PracticeScale from "@/components/practice/PracticeScale";
import ScenePicker from "@/components/practice/ScenePicker";
import PracticeScene, { toHistory, type ThreadItem } from "@/components/practice/PracticeScene";
import PracticeDebriefView from "@/components/practice/PracticeDebriefView";
import type { PracticeDebrief, PracticeScenario, PracticeTurn } from "@/components/practice/types";

type Screen = "gate" | "under18" | "before" | "picker" | "scene" | "debrief" | "after" | "feedback" | "thanks";
const GATE_KEY = "practice_gate";
const FN = "practice-roleplay";

const readGate = () => {
  try { return localStorage.getItem(GATE_KEY) === "under18"; } catch { return false; }
};
const saveUnder18 = () => {
  try { localStorage.setItem(GATE_KEY, "under18"); } catch { /* ignore */ }
};

const Practice = () => {
  const [screen, setScreen] = useState<Screen>(() => (readGate() ? "under18" : "gate"));
  const [scenarios, setScenarios] = useState<PracticeScenario[] | null>(null);
  const [listError, setListError] = useState(false);
  const [scenario, setScenario] = useState<PracticeScenario | null>(null);
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [ended, setEnded] = useState(false);
  const [closed, setClosed] = useState(false);
  const [endReason, setEndReason] = useState<string>("scene_over");
  const [debrief, setDebrief] = useState<PracticeDebrief | null>(null);
  const [debriefError, setDebriefError] = useState(false);
  const [feedback, setFeedback] = useState("");
  const runRef = useRef(0);
  const scenarioIdRef = useRef<string | null>(null);

  useEffect(() => {
    resetSessionId();
    return () => resetSessionId();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  const log = (
    stepName: string,
    stepType: "choice" | "freetext" | "practice_reply",
    value: { choice?: string; text?: string; summary?: string },
    extra: Record<string, unknown> = {},
  ) => {
    logSubmission({
      flowType: "practice",
      stepName,
      stepType,
      choiceValue: value.choice,
      freetextValue: value.text,
      aiResponseSummary: value.summary,
      metadata: {
        surface: "practice",
        scenario: scenarioIdRef.current,
        run: runRef.current || null,
        ...extra,
      },
    });
  };

  const loadList = useCallback(async () => {
    setListError(false);
    setScenarios(null);
    try {
      const res = await invokeEdgeFunctionWithRetry<{ scenarios: PracticeScenario[] }>(FN, { action: "list" });
      if (!res?.scenarios) throw new Error("no scenarios");
      setScenarios(res.scenarios);
    } catch {
      setListError(true);
    }
  }, []);

  const goPicker = () => {
    setScreen("picker");
    if (!scenarios) loadList();
  };

  const onGate = (adult: boolean) => {
    log("practice-age-gate", "choice", { choice: adult ? "18-plus" : "under-18" });
    if (adult) setScreen("before");
    else {
      saveUnder18();
      setScreen("under18");
    }
  };

  const startScene = (s: PracticeScenario) => {
    runRef.current += 1;
    scenarioIdRef.current = s.id;
    setScenario(s);
    setThread([]);
    setEnded(false);
    setClosed(false);
    setSendError(false);
    setDebrief(null);
    setDebriefError(false);
    log("practice-start", "choice", { choice: s.id });
    setScreen("scene");
  };

  const onSend = async (message: string): Promise<boolean> => {
    if (!scenario) return false;
    setLoading(true);
    setSendError(false);
    try {
      const res = await invokeEdgeFunctionWithRetry<PracticeTurn>(FN, {
        action: "turn",
        scenarioId: scenario.id,
        history: toHistory(thread),
        message,
      });
      if (!res || typeof res.text !== "string") throw new Error("bad turn");
      log("practice-turn", "freetext", { text: message });
      log(
        "practice-reply",
        "practice_reply",
        { summary: res.kind === "note" ? `[note] ${res.text}` : `${res.name ?? scenario.name}: ${res.text}` },
        { kind: res.kind, flag: res.flag ?? null, ended: !!res.ended, endReason: res.endReason ?? null, closed: !!res.closed, closeReason: res.closeReason ?? null },
      );
      setThread((t) => [...t, { role: "user", text: message }, { role: "assistant", text: res.text, turn: res }]);
      if (res.closed) {
        setClosed(true);
        if (res.closeReason === "minor") saveUnder18();
        log("practice-end", "choice", { choice: "closed" });
      } else if (res.ended) {
        setEnded(true);
        const reason = res.endReason || "scene_over";
        setEndReason(reason);
        log("practice-end", "choice", { choice: reason });
      }
      return true;
    } catch {
      setSendError(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchDebrief = async (reason: string, items: ThreadItem[]) => {
    if (!scenario) return;
    setDebrief(null);
    setDebriefError(false);
    try {
      const res = await invokeEdgeFunctionWithRetry<PracticeDebrief>(FN, {
        action: "debrief",
        scenarioId: scenario.id,
        history: toHistory(items),
        endReason: reason,
      });
      if (!res || typeof res.headline !== "string") throw new Error("bad debrief");
      const didWell = res.did_well ?? [];
      const missed = res.missed ?? [];
      log(
        "practice-debrief",
        "practice_reply",
        { summary: `${res.headline} | Worked: ${didWell.join("; ")} | Work on: ${missed.join("; ")} | Try: ${res.try_next ?? ""}` },
        { checks: res.checks ?? null },
      );
      setDebrief({ ...res, did_well: didWell, missed });
    } catch {
      setDebriefError(true);
    }
  };

  const openDebrief = (reason: string) => {
    setScreen("debrief");
    fetchDebrief(reason, thread);
  };

  const onEndByPerson = () => {
    setEndReason("ended_by_person");
    log("practice-end", "choice", { choice: "ended_by_person" });
    openDebrief("ended_by_person");
  };

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    log("practice-feedback", "freetext", { text: feedback.trim() });
    setScreen("thanks");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="ito practice (beta)"
        description="Practice what you'd say in a real moment. Short scenes, for people 18 and older. Anonymous, and in beta."
        path="/practice"
        noindex
      />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {screen === "gate" && <PracticeGate onAnswer={onGate} />}
          {screen === "under18" && <PracticeUnder18 />}
          {screen === "before" && (
            <PracticeScale
              question="Before you start: how sure are you that you'd know what to say in a moment like these?"
              onSelect={(n) => { log("confidence-pre", "choice", { choice: String(n) }); setTimeout(goPicker, 250); }}
              onSkip={goPicker}
            />
          )}
          {screen === "picker" && (
            <ScenePicker scenarios={scenarios} error={listError} onRetry={loadList} onPick={startScene} />
          )}
          {screen === "scene" && scenario && (
            <PracticeScene
              scenario={scenario}
              thread={thread}
              loading={loading}
              error={sendError}
              ended={ended}
              closed={closed}
              onSend={onSend}
              onEnd={onEndByPerson}
              onDebrief={() => openDebrief(endReason)}
            />
          )}
          {screen === "debrief" && (
            <PracticeDebriefView
              debrief={debrief}
              error={debriefError}
              onRetry={() => fetchDebrief(endReason, thread)}
              onAgain={() => scenario && startScene(scenario)}
              onAnother={goPicker}
              onDone={() => setScreen("after")}
            />
          )}
          {screen === "after" && (
            <PracticeScale
              question="How sure are you now that you'd know what to say?"
              onSelect={(n) => { log("confidence-post", "choice", { choice: String(n) }); setTimeout(() => setScreen("feedback"), 250); }}
              onSkip={() => setScreen("feedback")}
            />
          )}
          {screen === "feedback" && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-h2">Tell us what you think</h2>
              <Textarea
                aria-label="Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 1000))}
                maxLength={1000}
                placeholder="What felt real? What felt off or fake? What would you change?"
                className="min-h-[140px] text-body"
              />
              <Button size="lg" className="w-full" onClick={sendFeedback} disabled={!feedback.trim()}>Send feedback</Button>
              <p className="text-[13px] text-muted-foreground">Feedback is anonymous. Don't include names or anything that identifies someone.</p>
              <div className="flex justify-center">
                <button type="button" onClick={() => setScreen("thanks")} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Skip</button>
              </div>
            </div>
          )}
          {screen === "thanks" && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-h2">Thanks. That helps.</h2>
              <p className="text-body text-muted-foreground">Got a real situation on your mind?</p>
              <Button asChild size="lg" className="w-full">
                <Link to="/check-in">Go to ito</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Practice;
