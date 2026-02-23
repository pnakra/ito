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

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-h2 mb-1">
          Quick context so I don't give bad advice
        </h2>
        <p className="text-muted-foreground text-body">
          Skip whatever you want.
        </p>
      </div>

      <div className="space-y-6">
        {/* Timing */}
        <div className="space-y-3">
          <label className="text-body font-medium">
            Already happened or still deciding?
          </label>
          <div className="flex flex-col gap-2">
            {TIMING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTiming(opt.value)}
                disabled={isLoading}
                className={`text-left px-4 py-3 rounded-lg text-body transition-all duration-150 active:scale-[0.98] ${
                  timing === opt.value
                    ? "bg-primary/8 border-2 border-primary text-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <span className="flex items-center gap-2">
                  {timing === opt.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Physical stage — 2-column grid */}
        <div className="space-y-3">
          <label className="text-body font-medium">{isFutureOriented ? "What are you thinking about doing?" : "Has anything physical happened?"}</label>
          <div className="grid grid-cols-2 gap-2">
            {PHYSICAL_STAGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => togglePhysical(opt.value)}
                disabled={isLoading}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-[14px] transition-all duration-150 active:scale-[0.97] text-left ${
                  physicalStage.includes(opt.value)
                    ? "bg-primary/8 border-2 border-primary text-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <span className="flex items-center gap-2">
                  {physicalStage.includes(opt.value) && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ages */}
        <div className="space-y-3">
          <label className="text-body font-medium">Rough ages</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-caption text-muted-foreground mb-1.5 block">You</span>
              <Select value={ageUser} onValueChange={setAgeUser} disabled={isLoading}>
                <SelectTrigger className="bg-card shadow-card border-0">
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
              <span className="text-caption text-muted-foreground mb-1.5 block">Them</span>
              <Select value={ageOther} onValueChange={setAgeOther} disabled={isLoading}>
                <SelectTrigger className="bg-card shadow-card border-0">
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
        <div className="space-y-3">
          <label className="text-body font-medium">What are you trying to figure out?</label>
          <div className="flex flex-col gap-2">
            {INTENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setIntent(prev => prev === opt.value ? "" : opt.value)}
                disabled={isLoading}
                className={`text-left px-4 py-3 rounded-lg text-body transition-all duration-150 active:scale-[0.98] ${
                  intent === opt.value
                    ? "bg-primary/8 border-2 border-primary text-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <span className="flex items-center gap-2">
                  {intent === opt.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="text-caption text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6"
        >
          Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default SignalFloor;
