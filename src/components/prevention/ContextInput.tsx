import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

interface ContextInputProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  isActive: boolean;
}

const ContextInput = ({ value, onChange, onContinue, isActive }: ContextInputProps) => {
  const maxLength = 2000;

  if (!isActive) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-caption text-muted-foreground font-medium tabular-nums">5</span>
          <h2 className="text-h2">Anything else?</h2>
        </div>
        <p className="text-muted-foreground text-body ml-5">
          Optional — but more details can help.
        </p>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="What else is going on? How are you feeling?"
        className="min-h-[120px] resize-none text-body"
      />

      <div className="flex justify-between items-center">
        <span className="text-caption text-muted-foreground">
          {value.length} / {maxLength}
        </span>
        <Button onClick={onContinue} className="px-6">
          {value.trim() ? "Continue" : "Skip"} <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default ContextInput;
