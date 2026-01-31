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
  if (!isActive) return null;

  const selectedOption = MOVE_OPTIONS.find(m => m.id === selectedMove);
  const showLadder = selectedMove && selectedMove !== "not-sure";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Privacy banner at top */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 py-2 px-4 rounded-lg">
        <Lock className="w-3.5 h-3.5" />
        <span>Nothing is saved. This is just for you.</span>
      </div>

      <Card className="p-6 border-border/50">
        <h2 className="text-xl font-semibold text-center mb-2">
          What kind of move are you thinking about?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          This isn't a commitment. Just helps you name what's on your mind.
        </p>

        <div className="grid gap-2">
          {MOVE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                "hover:bg-muted/50",
                selectedMove === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Ladder visual - shows when a move is selected */}
      {showLadder && selectedOption && (
        <Card className="p-4 border-border/30 bg-muted/20">
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
