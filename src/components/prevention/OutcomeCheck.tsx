import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OutcomeCheckProps {
  onSelect: (outcome: string) => void;
}

const outcomes = [
  { id: "stopped", label: "I stopped" },
  { id: "checked-in", label: "I asked if they were okay" },
  { id: "didnt-proceed", label: "I decided not to do it" },
  { id: "not-sure", label: "I'm not sure / I didn't follow this" },
];

const OutcomeCheck = ({ onSelect }: OutcomeCheckProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    // Small delay for tactile feel
    setTimeout(() => onSelect(id), 150);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">What did you do?</h2>
        <p className="text-muted-foreground text-sm">
          Just for you to think about. Nothing is saved.
        </p>
      </div>
      
      <div className="flex flex-col gap-1.5">
        {outcomes.map((outcome) => (
          <button
            key={outcome.id}
            onClick={() => handleSelect(outcome.id)}
            className={cn(
              "text-left px-3.5 py-2.5 rounded-md border text-sm transition-all duration-150 active:scale-[0.98]",
              selected === outcome.id
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
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
