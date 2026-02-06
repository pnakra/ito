import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {stepNumber}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.id);
          return (
            <Card
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:border-primary/50",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "border-border/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/40"
                )}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <div>
                  <p className={cn("font-medium", isSelected && "text-primary")}>
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AfterDecisionStep;
