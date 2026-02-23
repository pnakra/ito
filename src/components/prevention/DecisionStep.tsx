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
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-[13px] text-muted-foreground font-medium tabular-nums">{stepNumber}</span>
          <h2 className="text-question">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-muted-foreground text-[15px] ml-5">{subtitle}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.id);
          
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "text-left px-3.5 py-3 rounded-[10px] min-h-[48px] text-[14px] transition-all duration-150 active:scale-[0.98]",
                isSelected 
                  ? "bg-accent border-[1.5px] border-primary text-foreground" 
                  : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
              )}
            >
              <span className="flex items-start gap-2">
                {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                <span>
                  <span className={cn("block", isSelected && "font-medium")}>{option.label}</span>
                  {option.description && (
                    <span className="block text-[13px] text-muted-foreground mt-0.5">{option.description}</span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      
      {multiSelect && selectedValues.length > 0 && (
        <p className="text-[13px] text-muted-foreground">
          Tap to add or remove
        </p>
      )}
    </div>
  );
};

export default DecisionStep;
