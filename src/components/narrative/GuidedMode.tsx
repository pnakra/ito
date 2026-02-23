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
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-caption text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to free write
      </button>

      <div className="space-y-6">
        <div>
          <h1 className="text-h1 mb-1">
            Let's walk through it
          </h1>
          <p className="text-muted-foreground text-body">
            Answer what feels right. Skip the rest.
          </p>
        </div>

        {/* Timing */}
        <div className="space-y-3">
          <label className="text-body font-medium">Already happened or still thinking about it?</label>
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

        {/* Relationship */}
        <div className="space-y-3">
          <label className="text-body font-medium">Who's the other person?</label>
          <Select value={relationship} onValueChange={setRelationship} disabled={isLoading}>
            <SelectTrigger className="bg-card shadow-card border-0">
              <SelectValue placeholder="Helps me understand the situation" />
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
        <div className="space-y-3">
          <label className="text-body font-medium">What happened?</label>
          <Textarea
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value.slice(0, maxLength))}
            placeholder="Describe what's going on..."
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Physical stage — 2-column grid */}
        <div className="space-y-3">
          <label className="text-body font-medium">
            {isFutureOriented ? "What are you thinking about doing?" : "Has anything physical happened?"}
          </label>
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

        {/* Worried */}
        <div className="space-y-3">
          <label className="text-body font-medium">What are you worried about?</label>
          <Textarea
            value={worried}
            onChange={(e) => setWorried(e.target.value.slice(0, maxLength))}
            placeholder="What matters to you here"
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
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

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!hasContent || isLoading}
            className="px-6"
          >
            Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidedMode;
