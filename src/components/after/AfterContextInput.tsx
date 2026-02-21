import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AfterContextInputProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  isActive: boolean;
  isLoading?: boolean;
}

const AfterContextInput = ({ 
  value, 
  onChange, 
  onContinue, 
  isActive,
  isLoading = false 
}: AfterContextInputProps) => {
  const maxLength = 2000;

  if (!isActive) return null;

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-xs text-muted-foreground font-medium tabular-nums">5</span>
          <h2 className="text-lg font-semibold">Anything else?</h2>
        </div>
        <p className="text-sm text-muted-foreground ml-5">Add any other details that might help (optional)</p>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="Share any other context that feels relevant..."
        className="min-h-[120px] resize-none text-sm"
        disabled={isLoading}
      />

      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {value.length} / {maxLength}
        </span>
        <Button
          onClick={onContinue}
          className="px-6 active:scale-[0.97]"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Continue"} 
          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default AfterContextInput;
