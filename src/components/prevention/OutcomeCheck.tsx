import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OutcomeCheckProps {
  onSelect: (outcome: string) => void;
  witness?: boolean;
}

const outcomes = [
  { id: "stopped", label: "I stopped" },
  { id: "checked-in", label: "I asked if they were okay" },
  { id: "didnt-proceed", label: "I decided not to do it" },
  { id: "not-sure", label: "I'm not sure / I didn't follow this" },
  { id: "prefer-not-to-say", label: "Prefer not to say" },
];

const witnessOutcomes = [
  { id: "stepped-in", label: "I stepped in or got help" },
  { id: "checked-on-them", label: "I checked on them" },
  { id: "told-someone", label: "I told someone who can act" },
  { id: "not-yet", label: "Nothing yet / not sure" },
  { id: "prefer-not-to-say", label: "Prefer not to say" },
];

const OutcomeCheck = ({ onSelect, witness }: OutcomeCheckProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 150);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-end">
        <span className="text-[13px] text-muted-foreground">2 of 2</span>
      </div>
      <div className="bg-card shadow-card rounded-lg p-5">
        <h2 className="text-h2 mb-1">{witness ? "What did you do, or plan to do?" : "What did you do?"}</h2>
        <p className="text-muted-foreground text-body">
          Just for you to think about. Anonymous. Nothing saved that identifies you.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {(witness ? witnessOutcomes : outcomes).map((outcome) => (
          <button
            key={outcome.id}
            onClick={() => handleSelect(outcome.id)}
            className={cn(
              "text-left px-3.5 py-3 rounded-lg min-h-[44px] text-[14px] transition-all duration-150 active:scale-[0.98]",
              selected === outcome.id
                ? "bg-primary/8 border-2 border-primary text-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            <span className="flex items-center gap-2">
              {selected === outcome.id && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              {outcome.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OutcomeCheck;
