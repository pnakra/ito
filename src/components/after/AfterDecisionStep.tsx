import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface AfterStepOption {
  id: string;
  label: string;
  description?: string;
}

interface AfterDecisionStepProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
  options: AfterStepOption[];
  selectedValues: string[];
  multiSelect?: boolean;
  onSelect: (id: string) => void;
  isActive: boolean;
}

const AfterDecisionStep = ({
  stepNumber,
  title,
  subtitle,
  options,
  selectedValues,
  multiSelect = false,
  onSelect,
  isActive
}: AfterDecisionStepProps) => {
  if (!isActive) return null;

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-xs text-muted-foreground font-medium tabular-nums">{stepNumber}</span>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-muted-foreground ml-5">{subtitle}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "text-left px-3.5 py-2.5 rounded-md border text-sm transition-all duration-150 active:scale-[0.98]",
                isSelected 
                  ? "border-primary/50 bg-primary/10 text-foreground" 
                  : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-start gap-2">
                {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                <span>
                  <span className={cn("block", isSelected && "font-medium")}>{option.label}</span>
                  {option.description && (
                    <span className="block text-xs text-muted-foreground mt-0.5">{option.description}</span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AfterDecisionStep;
