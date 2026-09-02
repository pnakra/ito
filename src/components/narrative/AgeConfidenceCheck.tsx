import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { AGE_BAND_OPTIONS } from "@/types/signals";

export const AGE_PREFER_NOT_TO_SAY = "prefer-not-to-say";

export interface AgeConfidenceResult {
  ageUser: string;
  confidencePre: number | null;
}

interface AgeConfidenceCheckProps {
  onSubmit: (result: AgeConfidenceResult) => void;
  isLoading: boolean;
}

const TOTAL_STEPS = 2;
const CONFIDENCE_SCALE = [1, 2, 3, 4, 5];

const AgeConfidenceCheck = ({ onSubmit, isLoading }: AgeConfidenceCheckProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [ageUser, setAgeUser] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleAgeContinue = () => {
    if (!ageUser) return;
    setStep(2);
  };

  const handleBack = () => {
    if (step > 1) setStep(1);
  };

  const handleSubmit = () => {
    onSubmit({ ageUser, confidencePre: confidence });
  };

  return (
    <div className="animate-fade-in flex flex-col min-h-[60vh]">
      {/* Top bar: back + progress */}
      <div className="flex items-center justify-between mb-6">
        {step > 1 ? (
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}
        <span className="text-[13px] text-muted-foreground">
          {step} of {TOTAL_STEPS}
        </span>
      </div>

      <div className="flex-1">
        {step === 1 && (
          <div className="animate-fade-in space-y-5">
            <h2 className="text-question">How old are you?</h2>
            <div className="flex flex-col gap-2.5">
              {[...AGE_BAND_OPTIONS, { value: AGE_PREFER_NOT_TO_SAY, label: "Prefer not to say" }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAgeUser(opt.value)}
                  disabled={isLoading}
                  className={`text-left px-4 h-[56px] rounded-[12px] text-[14px] transition-all duration-150 active:scale-[0.98] ${
                    ageUser === opt.value
                      ? "bg-accent border-[1.5px] border-primary text-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {ageUser === opt.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-5">
            <div className="space-y-5">
              <h2 className="text-question">
                About what you just described — how sure are you what to do here?
              </h2>
              <div className="grid grid-cols-5 gap-2.5">
                {CONFIDENCE_SCALE.map(n => (
                  <button
                    key={n}
                    onClick={() => setConfidence(prev => (prev === n ? null : n))}
                    disabled={isLoading}
                    className={`min-h-[48px] rounded-[10px] text-[14px] transition-all duration-150 active:scale-[0.97] ${
                      confidence === n
                        ? "bg-accent border-[1.5px] border-primary text-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>Not sure at all</span>
                <span>Very sure</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="mt-auto pt-6 space-y-3">
        <Button
          onClick={step === 1 ? handleAgeContinue : handleSubmit}
          disabled={isLoading || (step === 1 ? !ageUser : false)}
          size="default"
          className="w-full"
        >
          {step === 1 ? "Continue" : "Go"}
          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default AgeConfidenceCheck;
