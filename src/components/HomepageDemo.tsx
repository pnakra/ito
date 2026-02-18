import { useState, useEffect, useRef } from "react";
import { Loader2, HelpCircle, Pause } from "lucide-react";

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
      "You noticed hesitation in the moment but continued anyway.",
      "A 'yes' said while seeming distant isn't the same as enthusiasm.",
      "The fact that you're asking this question matters.",
    ],
    tension: "You're deciding what their behaviour meant, instead of asking them.",
  },
  {
    text: "i want to send them a message asking if they want to hook up but we haven't really talked in a while and i'm not sure if they'd be into it",
    signal: "green",
    label: "You're making assumptions",
    points: [
      "You're reading silence as ambiguity, not as a no.",
      "There's a gap between what you want and what you know they want.",
      "Asking directly removes the guesswork — and the risk.",
    ],
    tension: "You're about to act on a hope, not a signal.",
  },
];

type Phase = "typing" | "submitting" | "result" | "pause";

const TYPING_SPEED = 28; // ms per character
const SUBMIT_DELAY = 700;
const LOADING_DURATION = 1800;
const RESULT_DISPLAY = 4500;
const RESET_PAUSE = 1200;

const HomepageDemo = () => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  const scenario = SCENARIOS[scenarioIndex];

  // Intersection observer — start animation when in view
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

  // Typewriter
  useEffect(() => {
    if (!visible || phase !== "typing") return;
    if (charIndex < scenario.text.length) {
      const t = setTimeout(() => {
        setDisplayedText(scenario.text.slice(0, charIndex + 1));
        setCharIndex((i) => i + 1);
      }, TYPING_SPEED);
      return () => clearTimeout(t);
    } else {
      // Finished typing — move to submitting
      const t = setTimeout(() => setPhase("submitting"), SUBMIT_DELAY);
      return () => clearTimeout(t);
    }
  }, [visible, phase, charIndex, scenario.text]);

  // Loading → result
  useEffect(() => {
    if (phase !== "submitting") return;
    const t = setTimeout(() => setPhase("result"), LOADING_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  // Result → reset
  useEffect(() => {
    if (phase !== "result") return;
    const t = setTimeout(() => {
      setPhase("pause");
    }, RESULT_DISPLAY);
    return () => clearTimeout(t);
  }, [phase]);

  // Pause → next scenario
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

  const signalConfig = {
    yellow: {
      badge: "bg-[hsl(var(--signal-pause)/0.15)] text-[hsl(var(--signal-pause))] border border-[hsl(var(--signal-pause)/0.3)]",
      icon: <Pause className="w-4 h-4" />,
    },
    green: {
      badge: "bg-muted text-muted-foreground border border-border/50",
      icon: <HelpCircle className="w-4 h-4" />,
    },
  };

  const sig = signalConfig[scenario.signal];

  return (
    <div ref={containerRef} className="w-full max-w-sm mx-auto" onClick={() => { if (!hasStartedRef.current) { hasStartedRef.current = true; setVisible(true); } }}>
      {/* Phone frame */}
      <div className="relative rounded-[2rem] border-2 border-border bg-card shadow-xl overflow-hidden">
        {/* Status bar */}
        <div className="bg-card px-6 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">ito</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
          </div>
        </div>

        <div className="px-5 pb-6 space-y-4 min-h-[340px]">
          {/* Prompt */}
          <p className="text-xs text-muted-foreground text-center pt-1">
            What's going on?
          </p>

          {/* Text area mock */}
          <div className="rounded-xl border border-border bg-background p-3 min-h-[120px] text-sm text-foreground leading-relaxed relative">
            {displayedText}
            {phase === "typing" && (
              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
            )}
            {!displayedText && phase === "typing" && (
              <span className="text-muted-foreground/60 text-xs">
                Tell me what's going on.
              </span>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <div
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all duration-300 ${
                phase === "submitting" || phase === "result" || (phase === "typing" && charIndex === scenario.text.length)
                  ? "bg-primary text-primary-foreground opacity-100"
                  : "bg-muted text-muted-foreground opacity-40"
              }`}
            >
              Continue →
            </div>
          </div>

          {/* Loading state */}
          {phase === "submitting" && (
            <div className="flex flex-col items-center justify-center gap-2 py-4 animate-fade-in">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Breaking this down…</p>
            </div>
          )}

          {/* Result */}
          {phase === "result" && (
            <div className="space-y-3 animate-fade-in">
              {/* Badge */}
              <div className="flex justify-center">
                <div className={`${sig.badge} text-sm py-1.5 px-4 rounded-full font-medium flex items-center gap-1.5`}>
                  {sig.icon}
                  {scenario.label}
                </div>
              </div>

              {/* Points */}
              <div className="space-y-1.5">
                {scenario.points.map((p, i) => (
                  <p key={i} className="text-xs text-foreground/80 flex gap-2">
                    <span className="text-muted-foreground flex-shrink-0">•</span>
                    <span>{p}</span>
                  </p>
                ))}
              </div>

              {/* Tension callout */}
              <div className="bg-accent/40 border border-accent rounded-lg p-2.5">
                <p className="text-xs font-medium text-accent-foreground">{scenario.tension}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scenario dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {SCENARIOS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === scenarioIndex ? "bg-primary w-3" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomepageDemo;
