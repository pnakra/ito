import { useState, useEffect, useRef } from "react";

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
    label: "Something's off",
    points: [
      "You noticed hesitation but continued anyway.",
      "A 'yes' said while seeming distant isn't the same as enthusiasm.",
      "The fact that you're asking matters.",
    ],
    tension: "You're deciding what their behavior meant, instead of asking them.",
  },
  {
    text: "i want to send them a message asking if they want to hook up but we haven't really talked in a while and i'm not sure if they'd be into it",
    signal: "green",
    label: "You're guessing",
    points: [
      "You're reading silence as ambiguity, not as a no.",
      "There's a gap between what you want and what you know they want.",
      "Asking directly removes the guesswork — and the risk.",
    ],
    tension: "You're about to act on a hope, not a signal.",
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
      <div className="relative rounded-[16px] bg-card shadow-card overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <span className="text-[13px] text-muted-foreground">What's going on?</span>
        </div>

        <div className="px-5 pb-5 space-y-3 min-h-[220px]">
          <div className="rounded-[10px] border border-input bg-background p-4 min-h-[100px] text-[15px] text-foreground leading-relaxed">
            {displayedText}
            {phase === "typing" && (
              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
            )}
            {!displayedText && phase === "typing" && (
              <span className="text-muted-foreground/50 text-[15px]">
                Tell me what's going on...
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <div
              className={`text-[13px] px-4 py-2 rounded-[14px] font-semibold transition-all duration-200 ${
                phase === "submitting" || phase === "result" || (phase === "typing" && charIndex === scenario.text.length)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground opacity-40"
              }`}
            >
              Continue →
            </div>
          </div>

          {/* Loading: typing dots */}
          {phase === "submitting" && (
            <div className="flex justify-center py-3 animate-fade-in">
              <div className="flex gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          {/* Result */}
          {phase === "result" && (
            <div className="space-y-3 animate-fade-in">
              <div className="inline-flex">
                <span className="bg-accent text-primary border-[1.5px] border-primary text-[13px] py-1.5 px-3 rounded-full font-semibold">
                  {scenario.label}
                </span>
              </div>

              <div className="space-y-2">
                {scenario.points.map((p, i) => (
                  <p key={i} className="text-[13px] text-foreground/75">
                    {p}
                  </p>
                ))}
              </div>

              <div className="bg-callout rounded-[12px] p-3">
                <p className="text-[13px] font-medium italic text-foreground">{scenario.tension}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {SCENARIOS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === scenarioIndex ? "bg-primary w-4" : "bg-border w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomepageDemo;
