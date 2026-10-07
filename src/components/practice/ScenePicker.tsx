import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PracticeScenario } from "./types";

interface Props {
  scenarios: PracticeScenario[] | null;
  error: boolean;
  onRetry: () => void;
  onPick: (s: PracticeScenario) => void;
}

const ScenePicker = ({ scenarios, error, onRetry, onPick }: Props) => (
  <div className="animate-fade-in space-y-5">
    <h2 className="text-h2">Pick a scene</h2>
    {error ? (
      <div className="space-y-3">
        <p className="text-body text-muted-foreground">Practice didn't load. Try again.</p>
        <Button variant="outline" onClick={onRetry}>Try again</Button>
      </div>
    ) : !scenarios ? (
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    ) : (
      <div className="space-y-3">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s)}
            className="w-full text-left bg-card shadow-card rounded-lg p-5 space-y-1.5 transition-all duration-150 hover:bg-muted/60 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <p className="text-body font-medium text-foreground">{s.title}</p>
            <p className="text-body text-muted-foreground">{s.blurb}</p>
            <p className="text-[13px] text-muted-foreground">{s.minutes}</p>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default ScenePicker;
