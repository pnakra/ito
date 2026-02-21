import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  RELATIONSHIP_OPTIONS,
  serializeSignals,
} from "@/types/signals";

interface GuidedModeProps {
  onSubmit: (text: string, signals: StructuredSignals) => void;
  onBack: () => void;
  isLoading: boolean;
}

const GuidedMode = ({ onSubmit, onBack, isLoading }: GuidedModeProps) => {
  const [timing, setTiming] = useState("");
  const [relationship, setRelationship] = useState("");
  const [physicalStage, setPhysicalStage] = useState<string[]>([]);
  const [ageUser, setAgeUser] = useState("");
  const [ageOther, setAgeOther] = useState("");
  const [intent, setIntent] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [worried, setWorried] = useState("");
  const maxLength = 2000;

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
    if (relationship) signals.relationship = relationship;
    if (physicalStage.length > 0) signals.physicalStage = physicalStage;
    if (ageUser) signals.ageUser = ageUser;
    if (ageOther) signals.ageOther = ageOther;
    if (intent) signals.intent = intent;

    const parts: string[] = [];
    if (whatHappened.trim()) parts.push(whatHappened.trim());
    if (worried.trim()) parts.push(`What I'm worried about: ${worried.trim()}`);

    const signalText = serializeSignals(signals);
    if (signalText) parts.push(signalText);

    const narrative = parts.join("\n\n");
    if (narrative.trim()) {
      onSubmit(narrative, signals);
    }
  };

  const hasContent = whatHappened.trim() || worried.trim() || timing || physicalStage.length > 0;
  const isFutureOriented = timing === "deciding";

  return (
    <div className="space-y-4 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        back to free write
      </button>

      <div className="space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-0.5">
            let's walk through it
          </h2>
          <p className="text-muted-foreground text-sm">
            answer what feels right. skip the rest.
          </p>
        </div>

        {/* Timing */}
        <div className="space-y-2">
          <label className="text-sm font-medium">already happened or still thinking about it?</label>
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

        {/* Relationship */}
        <div className="space-y-2">
          <label className="text-sm font-medium">who's the other person?</label>
          <Select value={relationship} onValueChange={setRelationship} disabled={isLoading}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="helps me understand the situation" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* What happened */}
        <div className="space-y-2">
          <label className="text-sm font-medium">what happened?</label>
          <Textarea
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value.slice(0, maxLength))}
            placeholder="describe what's going on..."
            className="min-h-[100px] resize-none bg-card border-border"
            disabled={isLoading}
          />
        </div>

        {/* Physical stage */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {isFutureOriented ? "what are you thinking about doing?" : "has anything physical happened?"}
          </label>
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

        {/* Worried */}
        <div className="space-y-2">
          <label className="text-sm font-medium">what are you worried about?</label>
          <Textarea
            value={worried}
            onChange={(e) => setWorried(e.target.value.slice(0, maxLength))}
            placeholder="what matters to you here"
            className="min-h-[80px] resize-none bg-card border-border"
            disabled={isLoading}
          />
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

        <div className="flex justify-end pt-1">
          <Button
            onClick={handleSubmit}
            disabled={!hasContent || isLoading}
            className="px-6"
          >
            continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidedMode;
