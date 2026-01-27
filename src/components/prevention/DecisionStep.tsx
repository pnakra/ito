import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            {stepNumber}
          </span>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-muted-foreground ml-11">{subtitle}</p>
        )}
      </div>
      
      <div className="grid gap-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.id);
          
          return (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "h-auto py-4 px-5 justify-start text-left whitespace-normal",
                "border-2 transition-all duration-200",
                isSelected 
                  ? "border-primary bg-primary/10 text-foreground" 
                  : "border-border hover:border-primary/50 hover:bg-muted"
              )}
              onClick={() => onSelect(option.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground"
                )}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
      
      {multiSelect && selectedValues.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Tap options to toggle • Select all that apply
        </p>
      )}
    </Card>
  );
};

export default DecisionStep;
