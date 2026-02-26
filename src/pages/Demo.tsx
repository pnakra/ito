import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { ArrowRight, Play, RotateCcw } from "lucide-react";
import type { StructuredSignals } from "@/types/signals";
import { logVisit } from "@/lib/logVisit";
import { logSubmission } from "@/lib/submissionLogger";

interface DemoScenario {
  id: string;
  label: string;
  color: "neutral" | "yellow" | "red";
  tagline: string;
  description: string;
  signals: StructuredSignals;
  narrative: string;
  worried: string;
}

const SCENARIOS: DemoScenario[] = [
  {
    id: "red",
    label: "Red — Stop",
    color: "red",
    tagline: "Pressure, silence, and power imbalance",
    description:
      "Someone is quiet and not responding, there's a significant age gap, and the user is trying to convince them.",
    signals: {
      timing: "deciding",
      relationship: "stranger",
      physicalStage: ["touching-over-clothes"],
      ageUser: "25-plus",
      ageOther: "16-17",
      intent: "what-to-do",
    },
    narrative:
      "I met them through a friend. They seem into me but they're pretty quiet whenever things get more physical. I've been trying to get them to relax and go with it. They haven't said no but they're not really saying anything.",
    worried: "They're younger than me and I keep having to push things forward. But they haven't told me to stop.",
  },
  {
    id: "yellow",
    label: "Yellow — Pause & check",
    color: "yellow",
    tagline: "Mixed signals, alcohol involved",
    description:
      "At a party, someone they've been talking to is drunk and being flirty. They're unsure if the interest is genuine or just the alcohol.",
    signals: {
      timing: "deciding",
      relationship: "dating",
      physicalStage: ["talking-flirting", "kissed"],
      ageUser: "18-24",
      ageOther: "18-24",
      intent: "should-worry",
    },
    narrative:
      "We're at a party and they've been drinking a lot. They're being really flirty and touchy, way more than usual. We've hung out a few times sober and there's definitely something there, but tonight feels different. They keep leaning on me and saying they want to go somewhere private.",
    worried:
      "I can't tell if they actually want this or if it's just the alcohol. I don't want to take advantage of them but I also don't want to overthink it.",
  },
  {
    id: "neutral",
    label: "No flag",
    color: "neutral",
    tagline: "Mutual, clear, and comfortable",
    description:
      "Two 18-year-olds who've been dating for a few months. They've talked about what they want, both seem enthusiastic, and nothing feels off.",
    signals: {
      timing: "deciding",
      relationship: "partner",
      physicalStage: ["kissed", "touching-over-clothes"],
      ageUser: "18-24",
      ageOther: "18-24",
      intent: "was-it-okay",
    },
    narrative:
      "We've been together for a few months. Last night we were hanging out and things started getting more physical. They kept checking in and asking if I was good with it. I said yes and I meant it. We talked about boundaries before and we're on the same page.",
    worried: "I just want to make sure I'm reading things right.",
  },
];

const colorMap = {
  neutral: {
    bg: "bg-muted",
    border: "border-border",
    dot: "bg-muted-foreground",
    text: "text-foreground",
    hover: "hover:border-muted-foreground",
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-700",
    hover: "hover:border-amber-400",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    text: "text-red-700",
    hover: "hover:border-red-400",
  },
};

const Demo = () => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const navigate = useNavigate();

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    // Track scenario selection in both systems
    logVisit();  // logs current path /demo
    logSubmission({
      flowType: "before",
      stepName: "demo-scenario-selected",
      stepType: "choice",
      choiceValue: scenario.id,
      metadata: { scenario_label: scenario.label, scenario_color: scenario.color },
    });
  };

  if (selectedScenario) {
    return (
      <DemoWalkthrough
        scenario={selectedScenario}
        onBack={() => setSelectedScenario(null)}
        onTryYourOwn={() => navigate("/check-in")}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col justify-start pt-[8vh]">
        <section className="container mx-auto px-5 max-w-lg">
          <h1 className="text-[22px] font-semibold text-foreground text-center mb-2">
            See how ito works
          </h1>
          <p className="text-[14px] text-muted-foreground text-center mb-6 max-w-sm mx-auto">
            ito is a real-time reflection tool for young people navigating sexual consent. It helps someone pause in a moment of confusion and think clearly about what's happening.
          </p>
          <p className="text-[13px] text-muted-foreground text-center mb-8 max-w-sm mx-auto">
            Pick a scenario below to walk through the tool step by step. Each one shows how ito responds to a different level of risk.
          </p>

          <div className="space-y-3">
            {SCENARIOS.map((scenario) => {
              const c = colorMap[scenario.color];
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario)}
                  className={`w-full text-left ${c.bg} border ${c.border} ${c.hover} rounded-[14px] p-5 transition-all duration-150 active:scale-[0.99] group`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full ${c.dot} mt-1 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-[15px] font-medium ${c.text} mb-1`}>
                        {scenario.label}
                      </h2>
                      <p className="text-[13px] text-muted-foreground mb-2">
                        {scenario.tagline}
                      </p>
                      <p className="text-[13px] text-foreground/70 leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/check-in")}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Or try it yourself →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

/* ——————————————————————————————————————
   Demo Walkthrough — steps through guided flow
   with pre-filled data, showing what reviewer would see
   —————————————————————————————————————— */

interface DemoWalkthroughProps {
  scenario: DemoScenario;
  onBack: () => void;
  onTryYourOwn: () => void;
}

const DemoWalkthrough = ({ scenario, onBack, onTryYourOwn }: DemoWalkthroughProps) => {
  const navigate = useNavigate();

  const handleStartScenario = () => {
    sessionStorage.setItem(
      "ito-demo-scenario",
      JSON.stringify({
        signals: scenario.signals,
        narrative: scenario.narrative,
        worried: scenario.worried,
      })
    );
    // Track demo start in both systems
    logVisit();
    logSubmission({
      flowType: "before",
      stepName: "demo-scenario-started",
      stepType: "choice",
      choiceValue: scenario.id,
      metadata: { scenario_label: scenario.label, scenario_color: scenario.color },
    });
    navigate("/check-in?mode=guided&demo=true");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col justify-start pt-[8vh]">
        <section className="container mx-auto px-5 max-w-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            ← All scenarios
          </button>

          <div className={`${colorMap[scenario.color].bg} border ${colorMap[scenario.color].border} rounded-[14px] p-5 mb-6`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${colorMap[scenario.color].dot}`} />
              <h2 className={`text-[16px] font-semibold ${colorMap[scenario.color].text}`}>
                {scenario.label}
              </h2>
            </div>
            <p className="text-[14px] text-foreground/80 leading-relaxed mb-4">
              {scenario.description}
            </p>

            <div className="space-y-3">
              <div>
                <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  What they wrote
                </h3>
                <p className="text-[13px] text-foreground/70 italic leading-relaxed bg-warm/60 rounded-lg p-3">
                  "{scenario.narrative}"
                </p>
              </div>
              {scenario.worried && (
                <div>
                  <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    What they're worried about
                  </h3>
                  <p className="text-[13px] text-foreground/70 italic bg-warm/60 rounded-lg p-3">
                    "{scenario.worried}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStartScenario}
            className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-[14px] text-[15px] font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            See how ito responds
          </button>

          <p className="text-[12px] text-muted-foreground text-center mt-3">
            This will run the scenario through the real tool so you can see the actual AI response.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={onBack}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try another scenario
            </button>
            <button
              onClick={onTryYourOwn}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Try your own →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Demo;
