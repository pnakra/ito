import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type StructuredSignals,
  TIMING_OPTIONS,
  PHYSICAL_STAGE_OPTIONS,
  AGE_BAND_OPTIONS,
  INTENT_OPTIONS,
} from "@/types/signals";

interface SignalFloorProps {
  onSubmit: (signals: StructuredSignals) => void;
  onSkip: () => void;
  isLoading: boolean;
  detectedTiming?: "before" | "after" | "unclear";
}

const SignalFloor = ({ onSubmit, onSkip, isLoading, detectedTiming }: SignalFloorProps) => {
  const [timing, setTiming] = useState<string>(
    detectedTiming === "after" ? "already-happened" :
    detectedTiming === "before" ? "deciding" : ""
  );
  const [physicalStage, setPhysicalStage] = useState<string[]>([]);
  const [ageUser, setAgeUser] = useState("");
  const [ageOther, setAgeOther] = useState("");
  const [intent, setIntent] = useState("");

  const togglePhysical = (value: string) => {
    setPhysicalStage(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = () => {
    const signals: StructuredSignals = {};
    if (timing) signals.timing = timing as StructuredSignals["timing"];
    if (physicalStage.length > 0) signals.physicalStage = physicalStage;
    if (ageUser) signals.ageUser = ageUser;
    if (ageOther) signals.ageOther = ageOther;
    if (intent) signals.intent = intent;
    onSubmit(signals);
  };

  const isFutureOriented = timing === "deciding";
  const physicalLabel = isFutureOriented
    ? "what are you thinking about doing?"
    : "has anything physical happened?";

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">
          quick context so I don't give bad advice
        </h2>
        <p className="text-muted-foreground text-sm">
          skip whatever you want.
        </p>
      </div>

      <div className="space-y-5">
        {/* Timing */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            already happened or still deciding?
          </label>
          <div className="flex flex-col gap-1.5">
            {TIMING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTiming(opt.value)}
                disabled={isLoading}
                className={`text-left px-3.5 py-2 rounded-md border text-sm transition-all duration-150 active:scale-[0.98] ${
                  timing === opt.value
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {timing === opt.value && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Physical stage */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{physicalLabel}</label>
          <div className="flex flex-wrap gap-1.5">
            {PHYSICAL_STAGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => togglePhysical(opt.value)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-md border text-sm transition-all duration-150 active:scale-[0.97] ${
                  physicalStage.includes(opt.value)
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {physicalStage.includes(opt.value) && <Check className="w-3 h-3 text-primary" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ages */}
        <div className="space-y-2">
          <label className="text-sm font-medium">rough ages</label>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">you</span>
              <Select value={ageUser} onValueChange={setAgeUser} disabled={isLoading}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="age" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_BAND_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">them</span>
              <Select value={ageOther} onValueChange={setAgeOther} disabled={isLoading}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="age" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_BAND_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Intent */}
        <div className="space-y-2">
          <label className="text-sm font-medium">what are you trying to figure out?</label>
          <div className="flex flex-col gap-1.5">
            {INTENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setIntent(prev => prev === opt.value ? "" : opt.value)}
                disabled={isLoading}
                className={`text-left px-3.5 py-2 rounded-md border text-sm transition-all duration-150 active:scale-[0.98] ${
                  intent === opt.value
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {intent === opt.value && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-1">
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
          className="text-muted-foreground text-sm"
        >
          skip
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6"
        >
          continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default SignalFloor;
