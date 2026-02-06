import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { MoveType } from "./MoveSelection";

interface MutualityGroundingProps {
  selectedMove: MoveType | null;
  showUncertaintyOptions?: boolean;
  isActive: boolean;
}

// What mutual engagement looks like for different moves
const MUTUALITY_SIGNALS: Partial<Record<MoveType, string[]>> = {
  "sit-closer": [
    "They lean in too, not away",
    "They don't put their bag between you",
    "They seem comfortable, not stiff",
  ],
  "hold-hands": [
    "They hold back, not just let it happen",
    "Their hand relaxes into yours",
    "They don't pull away after a moment",
  ],
  "kiss": [
    "They lean in to meet you",
    "They kiss back, not just receive",
    "They don't freeze or go stiff",
  ],
  "touch-over": [
    "They're touching you back",
    "Their body moves toward you, not away",
    "They seem into it, not just tolerating it",
  ],
  "touch-under": [
    "They guide your hand or give clear signals",
    "They're actively participating",
    "Checking in feels natural, not awkward",
  ],
  "have-sex": [
    "Clear verbal enthusiasm from both people",
    "Active participation, not just allowing",
    "Either person can pause or stop anytime",
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

  const mutualitySignals = MUTUALITY_SIGNALS[selectedMove];
  const inBetweenOptions = IN_BETWEEN_OPTIONS[selectedMove];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Mutuality signals */}
      {mutualitySignals && mutualitySignals.length > 0 && (
        <Card className="p-5 border-border/30 bg-muted/10">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            What this usually looks like when it's mutual
          </h3>
          <ul className="space-y-2">
            {mutualitySignals.map((signal, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 mt-0.5 text-success shrink-0" />
                <span>{signal}</span>
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
