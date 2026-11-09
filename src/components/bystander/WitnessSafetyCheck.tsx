import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export interface WitnessSafetyResult {
  safety: "self" | "target" | "both" | "none" | "unsure";
  targetPreference: "no-report" | "no-share" | "no-contact" | "open-to-help" | "unknown";
}

const SAFETY_OPTIONS = [
  { value: "self", label: "I could become a target" },
  { value: "target", label: "The person targeted could face retaliation" },
  { value: "both", label: "Both of us could" },
  { value: "none", label: "No specific risk I can see" },
  { value: "unsure", label: "Not sure" },
] as const;

const PREFERENCE_OPTIONS = [
  { value: "no-report", label: "They asked me not to report it" },
  { value: "no-share", label: "They asked me not to share it" },
  { value: "no-contact", label: "They do not want me to contact them" },
  { value: "open-to-help", label: "They are open to help" },
  { value: "unknown", label: "I have not asked, or I am not sure" },
] as const;

const optionClass = (selected: boolean) =>
  `flex min-h-[48px] w-full items-center gap-2.5 rounded-[12px] border-[1.5px] px-4 py-3 text-left text-[14px] transition-colors ${
    selected ? "border-primary bg-accent text-foreground" : "border-transparent bg-muted text-foreground hover:bg-muted/80"
  }`;

const WitnessSafetyCheck = ({ onSubmit }: { onSubmit: (result: WitnessSafetyResult) => void }) => {
  const [safety, setSafety] = useState<WitnessSafetyResult["safety"] | null>(null);
  const [targetPreference, setTargetPreference] = useState<WitnessSafetyResult["targetPreference"] | null>(null);
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-question">Before you act, what could make this backfire?</h2>
        <p className="mt-2 text-[14px] text-muted-foreground">This helps ito avoid suggesting a move that puts you or them at more risk.</p>
      </div>
      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-foreground">Could stepping in lead to retaliation?</h3>
        <div className="space-y-2">
          {SAFETY_OPTIONS.map((option) => (
            <button key={option.value} type="button" onClick={() => setSafety(option.value)} className={optionClass(safety === option.value)}>
              {safety === option.value && <Check className="h-4 w-4 shrink-0 text-primary" />}
              {option.label}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-foreground">What has the person targeted said they want?</h3>
        <div className="space-y-2">
          {PREFERENCE_OPTIONS.map((option) => (
            <button key={option.value} type="button" onClick={() => setTargetPreference(option.value)} className={optionClass(targetPreference === option.value)}>
              {targetPreference === option.value && <Check className="h-4 w-4 shrink-0 text-primary" />}
              {option.label}
            </button>
          ))}
        </div>
      </section>
      <Button type="button" size="lg" className="w-full" disabled={!safety || !targetPreference} onClick={() => safety && targetPreference && onSubmit({ safety, targetPreference })}>
        Go
      </Button>
    </div>
  );
};

export default WitnessSafetyCheck;
