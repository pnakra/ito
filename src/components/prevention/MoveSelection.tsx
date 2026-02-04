import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type MoveType = 
  | "sit-closer"
  | "hold-hands" 
  | "kiss"
  | "make-out"
  | "touch-over"
  | "touch-under"
  | "go-private"
  | "have-sex"
  | "not-sure";

export interface MoveOption {
  id: MoveType;
  label: string;
  ladder: number; // Position on ladder 1-8
}

export const MOVE_OPTIONS: MoveOption[] = [
  { id: "sit-closer", label: "Sit closer", ladder: 1 },
  { id: "hold-hands", label: "Hold hands", ladder: 2 },
  { id: "kiss", label: "Kiss", ladder: 3 },
  { id: "make-out", label: "Make out", ladder: 4 },
  { id: "touch-over", label: "Touch over clothes", ladder: 5 },
  { id: "touch-under", label: "Touch under clothes", ladder: 6 },
  { id: "go-private", label: "Go somewhere private", ladder: 7 },
  { id: "have-sex", label: "Have sex", ladder: 8 },
  { id: "not-sure", label: "Not sure yet", ladder: 0 },
];

interface MoveSelectionProps {
  selectedMove: MoveType | null;
  onSelect: (move: MoveType) => void;
  onContinue: () => void;
  isActive: boolean;
}

const MoveSelection = ({ selectedMove, onSelect, onContinue, isActive }: MoveSelectionProps) => {
  const spectrumRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to spectrum when a move is selected
  useEffect(() => {
    if (selectedMove && selectedMove !== "not-sure" && spectrumRef.current) {
      // Small delay to let the spectrum render
      setTimeout(() => {
        spectrumRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [selectedMove]);

  if (!isActive) return null;

  const selectedOption = MOVE_OPTIONS.find(m => m.id === selectedMove);
  const showLadder = selectedMove && selectedMove !== "not-sure";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Privacy banner at top */}
      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground bg-muted/30 py-2 px-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>No data is stored long-term.</span>
        </div>
        <span className="text-xs text-muted-foreground/70">Your input is processed for analysis but not retained.</span>
      </div>

      <Card className="p-6 border-border/50">
        <h2 className="text-xl font-semibold text-center mb-2">
          What are you thinking about doing?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Start with one — you can always come back for others.
        </p>

        <div className="grid gap-2">
          {MOVE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                "hover:bg-muted/50 flex items-center gap-3",
                selectedMove === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border/50"
              )}
            >
              {/* Radio button indicator */}
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                selectedMove === option.id
                  ? "border-primary"
                  : "border-muted-foreground/40"
              )}>
                {selectedMove === option.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "transition-colors",
                selectedMove === option.id ? "text-primary font-medium" : "text-foreground"
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Ladder visual - shows when a move is selected */}
      {showLadder && selectedOption && (
        <Card ref={spectrumRef} className="p-4 border-border/30 bg-muted/20 animate-fade-in">
          <p className="text-xs text-muted-foreground text-center mb-3">
            There's a whole spectrum between here and there
          </p>
          <div className="flex flex-col gap-1">
            {MOVE_OPTIONS.filter(m => m.id !== "not-sure")
              .sort((a, b) => b.ladder - a.ladder)
              .map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm transition-all",
                    option.id === selectedMove
                      ? "bg-primary/20 text-primary font-medium"
                      : option.ladder < selectedOption.ladder
                        ? "text-muted-foreground/70"
                        : "text-muted-foreground/40"
                  )}
                >
                  {option.label}
                  {option.id === selectedMove && (
                    <span className="ml-2 text-xs">← you're here</span>
                  )}
                </div>
              ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            You don't have to jump ahead. There are options in between.
          </p>
        </Card>
      )}

      {selectedMove && (
        <div className="flex justify-center pt-2">
          <Button size="lg" onClick={onContinue} className="px-8">
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MoveSelection;
