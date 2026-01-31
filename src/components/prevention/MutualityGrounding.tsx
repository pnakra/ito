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
  "make-out": [
    "Both people are actively involved",
    "Bodies are relaxed, not tense",
    "You can pause without it being weird",
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
  "go-private": [
    "They suggest it or enthusiastically agree",
    "They're leading or walking with you",
    "They're not looking for friends or exits",
  ],
  "have-sex": [
    "Clear verbal enthusiasm from both people",
    "Active participation, not just allowing",
    "Either person can pause or stop anytime",
  ],
};

// "In-between" options when uncertainty is detected
const IN_BETWEEN_OPTIONS: Partial<Record<MoveType, string[]>> = {
  "kiss": [
    "Sit closer first",
    "Hold hands to see how it feels",
    "Longer hug to test the vibe",
  ],
  "make-out": [
    "Start with a single kiss",
    "Keep hands in neutral places",
    "Take a break and talk",
  ],
  "touch-over": [
    "Stay with making out for now",
    "Keep hands on their back or arms",
    "Ask how they're doing",
  ],
  "touch-under": [
    "Stay over clothes",
    "Ask before moving anywhere new",
    "Give them a chance to guide you",
  ],
  "go-private": [
    "Stay where friends can see you",
    "Suggest stepping outside briefly instead",
    "Check in about what they want",
  ],
  "have-sex": [
    "More time with clothes on",
    "Touching that stays above the waist",
    "Actually talking about what you both want",
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

      {/* In-between options (only if uncertainty detected) */}
      {showUncertaintyOptions && inBetweenOptions && inBetweenOptions.length > 0 && (
        <Card className="p-5 border-border/30 bg-warning/5">
          <h3 className="text-sm font-medium text-warning mb-3">
            If you're unsure, you don't have to jump ahead
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            These are options, not rules. Just ideas if you want to slow down.
          </p>
          <ul className="space-y-1.5">
            {inBetweenOptions.map((option, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {option}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default MutualityGrounding;
