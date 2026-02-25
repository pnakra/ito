import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
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
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
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
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-question mb-1">
          A few quick questions for better advice
        </h2>
        <p className="text-muted-foreground text-[15px]">
          Skip whatever you want.
        </p>
      </div>

      <div className="space-y-8">
        {/* Timing */}
        <div className="space-y-4">
          <label className="text-[15px] font-medium">Did this already happen, or is it still being figured out?</label>
          <div className="flex flex-col gap-2.5">
            {TIMING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTiming(opt.value)}
                disabled={isLoading}
                className={`text-left px-4 h-[56px] rounded-[12px] text-[14px] transition-all duration-150 active:scale-[0.98] ${
                  timing === opt.value
                    ? "bg-accent border-[1.5px] border-primary text-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {timing === opt.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Physical stage */}
        <div className="space-y-4">
          <label className="text-[15px] font-medium">{isFutureOriented ? "What are you thinking about doing?" : "Has anything physical happened?"}</label>
          <div className="grid grid-cols-2 gap-2.5">
            {PHYSICAL_STAGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => togglePhysical(opt.value)}
                disabled={isLoading}
                className={`min-h-[48px] px-3.5 py-2.5 rounded-[10px] text-[14px] transition-all duration-150 active:scale-[0.97] text-left ${
                  physicalStage.includes(opt.value)
                    ? "bg-accent border-[1.5px] border-primary text-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
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
        <div className="space-y-4">
          <label className="text-[15px] font-medium">Rough ages</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[13px] text-muted-foreground mb-2 block">You</span>
              <Select value={ageUser} onValueChange={setAgeUser} disabled={isLoading}>
                <SelectTrigger className="h-[56px] bg-card shadow-card border-0 rounded-[12px]">
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
              <span className="text-[13px] text-muted-foreground mb-2 block">Them</span>
              <Select value={ageOther} onValueChange={setAgeOther} disabled={isLoading}>
                <SelectTrigger className="h-[56px] bg-card shadow-card border-0 rounded-[12px]">
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
        <div className="space-y-4">
          <label className="text-[15px] font-medium">What are you trying to figure out?</label>
          <div className="flex flex-col gap-2.5">
            {INTENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setIntent(prev => prev === opt.value ? "" : opt.value)}
                disabled={isLoading}
                className={`text-left px-4 h-[56px] rounded-[12px] text-[14px] transition-all duration-150 active:scale-[0.98] ${
                  intent === opt.value
                    ? "bg-accent border-[1.5px] border-primary text-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {intent === opt.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          size="sm"
          className="w-auto px-6 h-11"
        >
          Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default SignalFloor;
