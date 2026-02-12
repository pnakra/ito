import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            5
          </span>
          <h2 className="text-xl md:text-2xl font-bold">Anything else?</h2>
        </div>
        <p className="text-muted-foreground ml-11">
          Optional — but more details can help.
        </p>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="What else is going on? How are you feeling?"
        className="min-h-[120px] resize-none mb-4"
      />

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {value.length} / {maxLength}
        </span>
        <Button onClick={onContinue} className="px-6">
          {value.trim() ? "Continue" : "Skip"} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ContextInput;
