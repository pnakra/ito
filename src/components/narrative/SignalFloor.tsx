import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  /** Whether the narrative is future-oriented (detected from text) */
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
    ? "What are you thinking about?"
    : "Has anything physical happened?";

  return (
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-lg sm:text-xl font-semibold text-center mb-1">
        A couple quick things that help me be more accurate
      </h2>
      <p className="text-muted-foreground text-center mb-6 text-sm">
        Skip if you want — these just make the advice better.
      </p>

      <div className="space-y-5">
        {/* 1. Timing */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Is this something that already happened, or something you're thinking about?
          </label>
          <div className="flex flex-col gap-2">
            {TIMING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTiming(opt.value)}
                disabled={isLoading}
                className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  timing === opt.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
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

        {/* 2. Physical stage (multi-select) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{physicalLabel}</label>
          <div className="flex flex-wrap gap-2">
            {PHYSICAL_STAGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => togglePhysical(opt.value)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  physicalStage.includes(opt.value)
                    ? "border-primary bg-primary/10 text-foreground"
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

        {/* 3. Ages */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Rough ages help me give better advice
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">You</span>
              <Select value={ageUser} onValueChange={setAgeUser} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Your age" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_BAND_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Them</span>
              <Select value={ageOther} onValueChange={setAgeOther} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Their age" />
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

        {/* 4. Intent */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What are you hoping to figure out?</label>
          <div className="flex flex-col gap-2">
            {INTENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setIntent(prev => prev === opt.value ? "" : opt.value)}
                disabled={isLoading}
                className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  intent === opt.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
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

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
          className="text-muted-foreground"
        >
          Skip these
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          size="lg"
          className="px-8"
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default SignalFloor;
