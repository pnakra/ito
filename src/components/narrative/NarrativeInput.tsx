import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowRight, Lock, ChevronDown } from "lucide-react";

const PLACEHOLDER_ROTATIONS = [
  "Tell me what's going on.",
  "You can write this like a Reddit post or text to a friend.",
  "Something happen or something might happen?",
  "What are you unsure about?",
];

interface NarrativeInputProps {
  onSubmit: (text: string) => void;
  onGuidedMode: () => void;
  isLoading: boolean;
}

const NarrativeInput = ({ onSubmit, onGuidedMode, isLoading }: NarrativeInputProps) => {
  const [text, setText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 3000;

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDER_ROTATIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Privacy banner */}
      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground bg-muted/30 py-2 px-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>No data is stored long-term.</span>
        </div>
        <span className="text-xs text-muted-foreground/70">Your input is processed for analysis but not retained.</span>
      </div>

      <Card className="p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-2">
          What's going on?
        </h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          Describe what happened or what you're thinking about. Write as much or as little as you want.
        </p>

        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER_ROTATIONS[placeholderIndex]}
          className="min-h-[160px] resize-none mb-4 text-base"
          disabled={isLoading}
        />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {text.length > 0 && `${text.length} / ${maxLength}`}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            size="lg"
            className="px-8"
          >
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Guided mode toggle */}
      <button
        onClick={onGuidedMode}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <ChevronDown className="w-4 h-4" />
        Not sure how to start? Use guided mode.
      </button>
    </div>
  );
};

export default NarrativeInput;
