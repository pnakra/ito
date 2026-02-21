import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface DemoScenario {
  text: string;
  signal: "yellow" | "green";
  label: string;
  points: string[];
  tension: string;
}

const SCENARIOS: DemoScenario[] = [
  {
    text: "we've been together 2 years and things have been good but last night felt off — they said yes but seemed distant the whole time and i don't know if i should have stopped",
    signal: "yellow",
    label: "something's off",
    points: [
      "you noticed hesitation but continued anyway.",
      "a 'yes' said while seeming distant isn't the same as enthusiasm.",
      "the fact that you're asking matters.",
    ],
    tension: "you're deciding what their behaviour meant, instead of asking them.",
  },
  {
    text: "i want to send them a message asking if they want to hook up but we haven't really talked in a while and i'm not sure if they'd be into it",
    signal: "green",
    label: "you're guessing",
    points: [
      "you're reading silence as ambiguity, not as a no.",
      "there's a gap between what you want and what you know they want.",
      "asking directly removes the guesswork — and the risk.",
    ],
    tension: "you're about to act on a hope, not a signal.",
  },
];

type Phase = "typing" | "submitting" | "result" | "pause";

const TYPING_SPEED = 24;
const SUBMIT_DELAY = 500;
const LOADING_DURATION = 1400;
const RESULT_DISPLAY = 4000;
const RESET_PAUSE = 900;

const HomepageDemo = () => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  const scenario = SCENARIOS[scenarioIndex];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true;
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || phase !== "typing") return;
    if (charIndex < scenario.text.length) {
      const t = setTimeout(() => {
        setDisplayedText(scenario.text.slice(0, charIndex + 1));
        setCharIndex((i) => i + 1);
      }, TYPING_SPEED);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("submitting"), SUBMIT_DELAY);
      return () => clearTimeout(t);
    }
  }, [visible, phase, charIndex, scenario.text]);

  useEffect(() => {
    if (phase !== "submitting") return;
    const t = setTimeout(() => setPhase("result"), LOADING_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result") return;
    const t = setTimeout(() => setPhase("pause"), RESULT_DISPLAY);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "pause") return;
    const t = setTimeout(() => {
      setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
      setDisplayedText("");
      setCharIndex(0);
      setPhase("typing");
    }, RESET_PAUSE);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div ref={containerRef} className="w-full max-w-sm mx-auto" onClick={() => { if (!hasStartedRef.current) { hasStartedRef.current = true; setVisible(true); } }}>
      {/* Minimal frame — no phone chrome */}
      <div className="relative rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 pt-3 pb-1">
          <span className="text-xs text-muted-foreground">what's going on?</span>
        </div>

        <div className="px-4 pb-4 space-y-3 min-h-[280px]">
          {/* Text area mock */}
          <div className="rounded-md border border-border bg-background p-3 min-h-[100px] text-sm text-foreground leading-relaxed">
            {displayedText}
            {phase === "typing" && (
              <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-middle" />
            )}
            {!displayedText && phase === "typing" && (
              <span className="text-muted-foreground/50 text-sm">
                tell me what's going on.
              </span>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <div
              className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-all duration-200 ${
                phase === "submitting" || phase === "result" || (phase === "typing" && charIndex === scenario.text.length)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground opacity-40"
              }`}
            >
              continue →
            </div>
          </div>

          {/* Loading */}
          {phase === "submitting" && (
            <div className="flex items-center gap-2 py-3 animate-fade-in">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">thinking…</p>
            </div>
          )}

          {/* Result */}
          {phase === "result" && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="inline-flex">
                <span className={`text-xs py-1 px-2.5 rounded-md font-medium ${
                  scenario.signal === "yellow"
                    ? "bg-[hsl(var(--signal-pause)/0.15)] text-[hsl(var(--signal-pause))]"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {scenario.label}
                </span>
              </div>

              <div className="space-y-1">
                {scenario.points.map((p, i) => (
                  <p key={i} className="text-xs text-foreground/75 flex gap-2">
                    <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                    <span>{p}</span>
                  </p>
                ))}
              </div>

              <div className="border-l-2 border-primary/30 pl-3 py-1">
                <p className="text-xs font-medium text-foreground/80">{scenario.tension}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2.5">
        {SCENARIOS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-200 ${
              i === scenarioIndex ? "bg-primary w-4" : "bg-border w-1"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomepageDemo;
