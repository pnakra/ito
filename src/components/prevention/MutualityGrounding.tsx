import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import type { MoveType } from "./MoveSelection";

interface MutualityGroundingProps {
  selectedMove: MoveType | null;
  showUncertaintyOptions?: boolean;
  isActive: boolean;
}

// Direct checks — not hedged, not a checklist to game
const MUTUALITY_CHECKS: Partial<Record<MoveType, string[]>> = {
  "sit-closer": [
    "Are they moving closer too, or just not leaving?",
    "Not pulling away is not the same as wanting you there.",
  ],
  "hold-hands": [
    "Are they holding back, or just letting it happen?",
    "If you let go, would they reach for you again?",
  ],
  "kiss": [
    "Are they leaning in, or are you the only one moving?",
    "Not stopping you is not the same as wanting it.",
  ],
  "touch-over": [
    "Are they responding, or just not stopping you?",
    "Silence is not a yes. Have you actually asked?",
  ],
  "touch-under": [
    "Have you asked clearly? Not hinted. Asked.",
    "Going along with it is not the same as wanting it.",
  ],
  "have-sex": [
    "Are they enthusiastic, or just not saying no?",
    "Can either of you stop without it being a problem?",
  ],
};

// Communication-focused options when uncertainty is detected
// These are about checking in, NOT tactical alternatives to pressure someone
const IN_BETWEEN_OPTIONS: Partial<Record<MoveType, string[]>> = {
  "kiss": [
    "Ask: 'Can I kiss you?'",
    "Say: 'I'd like to kiss you. How do you feel about that?'",
    "Check: 'Is this okay?' before leaning in",
  ],
  "touch-over": [
    "Ask: 'Is this okay?'",
    "Say: 'Tell me if you want me to stop'",
    "Check: 'Do you want this?'",
  ],
  "touch-under": [
    "Ask clearly: 'Can I touch you here?'",
    "Say: 'I want to check in with you'",
    "Ask: 'What do you want right now?'",
  ],
  "have-sex": [
    "Have an actual conversation about what you both want",
    "Ask: 'Are you sure you want this?'",
    "Say: 'I need to know you want this too'",
  ],
};

const MutualityGrounding = ({ selectedMove, showUncertaintyOptions, isActive }: MutualityGroundingProps) => {
  if (!isActive || !selectedMove || selectedMove === "not-sure") return null;

  const mutualityChecks = MUTUALITY_CHECKS[selectedMove];
  const inBetweenOptions = IN_BETWEEN_OPTIONS[selectedMove];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Enthusiasm checks — interrogative, not observational */}
      {mutualityChecks && mutualityChecks.length > 0 && (
        <Card className="p-5 border-border/30 bg-muted/10">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Be honest with yourself
          </h3>
          <ul className="space-y-2">
            {mutualityChecks.map((check, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <HelpCircle className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Communication options (only if uncertainty detected) */}
      {showUncertaintyOptions && inBetweenOptions && inBetweenOptions.length > 0 && (
        <Card className="p-5 border-border/30 bg-warning/5">
          <h3 className="text-sm font-medium text-warning mb-3">
            If you're unsure, ask them
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            These are ways to check in. The goal is to hear what they actually want, not to find a workaround.
          </p>
          <ul className="space-y-1.5">
            {inBetweenOptions.map((option, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {option}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-muted-foreground/70 mt-3 italic">
            If asking feels awkward, that might be a sign you're not ready.
          </p>
        </Card>
      )}
    </div>
  );
};

export default MutualityGrounding;
