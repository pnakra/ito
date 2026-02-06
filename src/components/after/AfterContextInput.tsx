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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          5
        </div>
        <div>
          <h2 className="text-xl font-semibold">Anything else?</h2>
          <p className="text-sm text-muted-foreground">Add any other details that might help (optional)</p>
        </div>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="Share any other context that feels relevant..."
        className="min-h-[120px] resize-none"
        disabled={isLoading}
      />

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {value.length} / {maxLength}
        </span>
        <Button
          onClick={onContinue}
          size="lg"
          className="px-6"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Continue"} 
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AfterContextInput;
