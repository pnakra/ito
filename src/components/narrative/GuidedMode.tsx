import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check } from "lucide-react";
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

const TOTAL_STEPS = 7;

const GuidedMode = ({ onSubmit, onBack, isLoading }: GuidedModeProps) => {
  const [step, setStep] = useState(1);
  const [timing, setTiming] = useState("");
  const [relationship, setRelationship] = useState("");
  const [physicalStage, setPhysicalStage] = useState<string[]>([]);
  const [ageUser, setAgeUser] = useState("");
  const [ageOther, setAgeOther] = useState("");
  const [intent, setIntent] = useState<string[]>([]);
  const [whatHappened, setWhatHappened] = useState("");
  const [worried, setWorried] = useState("");
  const maxLength = 3000;
  const minLength = 10;

  // Auto-advance for step 1 (timing)
  useEffect(() => {
    if (step === 1 && timing) {
      const t = setTimeout(() => setStep(2), 300);
      return () => clearTimeout(t);
    }
  }, [timing, step]);

  const togglePhysical = (value: string) => {
    setPhysicalStage(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleIntent = (value: string) => {
    setIntent(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    const signals: StructuredSignals = {};
    if (timing) signals.timing = timing as StructuredSignals["timing"];
    if (relationship) signals.relationship = relationship;
    if (physicalStage.length > 0) signals.physicalStage = physicalStage;
    if (ageUser) signals.ageUser = ageUser;
    if (ageOther) signals.ageOther = ageOther;
    if (intent.length > 0) signals.intent = intent[0];

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

  const canContinue = () => {
    switch (step) {
      case 1: return !!timing;
      case 2: return !!relationship;
      case 3: return whatHappened.trim().length >= minLength;
      case 4: return physicalStage.length > 0;
      case 5: return !!ageUser && !!ageOther;
      case 6: return true; // optional
      case 7: return intent.length > 0;
      default: return false;
    }
  };

  const isOptional = step === 6;

  const next = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleSubmit();
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const isFutureOriented = timing === "deciding";

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col">
      {/* Top bar: back arrow */}
      <div className="pt-4 pb-2">
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col animate-fade-in" key={step}>
        <div className="pt-6 pb-4">
          {/* Step content */}
          {step === 1 && (
            <StepLayout question="Did this already happen, or is it still being figured out?">
              <div className="flex flex-col gap-2.5">
                {TIMING_OPTIONS.map(opt => (
                  <OptionButton
                    key={opt.value}
                    label={opt.label}
                    selected={timing === opt.value}
                    onClick={() => setTiming(opt.value)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </StepLayout>
          )}

          {step === 2 && (
            <StepLayout question="Who's the other person?">
              <Select value={relationship} onValueChange={setRelationship} disabled={isLoading}>
                <SelectTrigger className="h-[56px] bg-card shadow-card border-0 rounded-[12px] text-[15px]">
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </StepLayout>
          )}

          {step === 3 && (
            <StepLayout question={isFutureOriented ? "What are you thinking about doing?" : "What happened?"}>
              <div className="relative">
                <Textarea
                  value={whatHappened}
                  onChange={(e) => setWhatHappened(e.target.value.slice(0, maxLength))}
                  placeholder="Just describe it in your own words"
                  className="min-h-[140px] resize-none"
                  disabled={isLoading}
                />
                <span className="absolute bottom-3 right-3 text-[13px] text-muted-foreground">
                  {whatHappened.length}/{maxLength}
                </span>
              </div>
            </StepLayout>
          )}

          {step === 4 && (
            <StepLayout question={isFutureOriented ? "What are you thinking about doing?" : "Has anything physical happened?"}>
              <div className="grid grid-cols-2 gap-2.5">
                {PHYSICAL_STAGE_OPTIONS.map(opt => (
                  <ChipButton
                    key={opt.value}
                    label={opt.label}
                    selected={physicalStage.includes(opt.value)}
                    onClick={() => togglePhysical(opt.value)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </StepLayout>
          )}

          {step === 5 && (
            <StepLayout question="How old are you both, roughly?">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[13px] text-muted-foreground mb-2 block">You</span>
                  <Select value={ageUser} onValueChange={setAgeUser} disabled={isLoading}>
                    <SelectTrigger className="h-[56px] bg-card shadow-card border-0 rounded-[12px] text-[15px]">
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
                    <SelectTrigger className="h-[56px] bg-card shadow-card border-0 rounded-[12px] text-[15px]">
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
            </StepLayout>
          )}

          {step === 6 && (
            <StepLayout question="What are you worried about?">
              <Textarea
                value={worried}
                onChange={(e) => setWorried(e.target.value.slice(0, maxLength))}
                placeholder="Anything on your mind about this?"
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </StepLayout>
          )}

          {step === 7 && (
            <StepLayout question="What are you trying to figure out?">
              <div className="grid grid-cols-2 gap-2.5">
                {INTENT_OPTIONS.map(opt => (
                  <ChipButton
                    key={opt.value}
                    label={opt.label}
                    selected={intent.includes(opt.value)}
                    onClick={() => toggleIntent(opt.value)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </StepLayout>
          )}
        </div>
      </div>

      {/* Bottom: dots + continue + skip */}
      <div className="mt-auto pb-8 pt-6 space-y-4">
        {/* Dot progress */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 === step ? "bg-primary" : "bg-input"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          disabled={!canContinue() && !isOptional}
          className={`transition-opacity ${(!canContinue() && !isOptional) ? "opacity-40" : "opacity-100"}`}
        >
          {isOptional && !canContinue() ? "Skip" : "Continue"}
        </Button>

        {isOptional && canContinue() && (
          <button
            onClick={next}
            className="block mx-auto text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

/* Sub-components */

const StepLayout = ({ question, children }: { question: string; children: React.ReactNode }) => (
  <div className="space-y-6">
    <h2 className="text-question">{question}</h2>
    {children}
  </div>
);

const OptionButton = ({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left px-4 h-[56px] rounded-[12px] text-[14px] transition-all duration-150 active:scale-[0.98] ${
      selected
        ? "bg-accent border-[1.5px] border-primary text-foreground"
        : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
    }`}
  >
    <span className="flex items-center gap-2.5">
      {selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
      {label}
    </span>
  </button>
);

const ChipButton = ({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-h-[48px] px-3.5 py-2.5 rounded-[10px] text-[14px] transition-all duration-150 active:scale-[0.97] text-left ${
      selected
        ? "bg-accent border-[1.5px] border-primary text-foreground"
        : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
    }`}
  >
    <span className="flex items-center gap-2">
      {selected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
      {label}
    </span>
  </button>
);

export default GuidedMode;
