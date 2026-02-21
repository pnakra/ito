import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepOption {
  id: string;
  label: string;
  description?: string;
}

interface DecisionStepProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
  options: StepOption[];
  selectedValues: string[];
  multiSelect?: boolean;
  onSelect: (value: string) => void;
  isActive: boolean;
}

const DecisionStep = ({
  stepNumber,
  title,
  subtitle,
  options,
  selectedValues,
  multiSelect = false,
  onSelect,
  isActive
}: DecisionStepProps) => {
  if (!isActive) return null;

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-xs text-muted-foreground font-medium tabular-nums">{stepNumber}</span>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-muted-foreground text-sm ml-5">{subtitle}</p>
        )}
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
      
      {multiSelect && selectedValues.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Tap to add or remove
        </p>
      )}
    </div>
  );
};

export default DecisionStep;
