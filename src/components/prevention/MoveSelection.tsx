import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type MoveType =
  | "sit-closer"
  | "hold-hands" 
  | "kiss"
  | "touch-over"
  | "touch-under"
  | "have-sex"
  | "not-sure";

export interface MoveOption {
  id: MoveType;
  label: string;
}

export const MOVE_OPTIONS: MoveOption[] = [
  { id: "sit-closer", label: "Sit closer" },
  { id: "hold-hands", label: "Hold hands" },
  { id: "kiss", label: "Kiss" },
  { id: "touch-over", label: "Touch over clothes" },
  { id: "touch-under", label: "Touch under clothes" },
  { id: "have-sex", label: "Have sex" },
  { id: "not-sure", label: "Not sure yet" },
];

interface MoveSelectionProps {
  selectedMove: MoveType | null;
  onSelect: (move: MoveType) => void;
  onContinue: () => void;
  isActive: boolean;
}

const MoveSelection = ({ selectedMove, onSelect, onContinue, isActive }: MoveSelectionProps) => {
  if (!isActive) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-caption text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>Nothing is saved. Close the tab and it's gone.</span>
      </div>

      <div>
        <h2 className="text-h2 mb-1">
          What are you thinking about doing?
        </h2>
        <p className="text-body text-muted-foreground">
          Pick one — you can always come back for others.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MOVE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "text-left px-3.5 py-3 rounded-lg min-h-[44px] text-[14px] transition-all duration-150 active:scale-[0.98]",
              selectedMove === option.id
                ? "bg-primary/8 border-2 border-primary text-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            <span className="flex items-center gap-2">
              {selectedMove === option.id && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {selectedMove && (
        <div className="flex justify-end pt-1">
          <Button onClick={onContinue} className="px-6">
            Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MoveSelection;
