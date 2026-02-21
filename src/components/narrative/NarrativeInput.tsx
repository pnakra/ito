import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Lock, ChevronDown } from "lucide-react";

const PLACEHOLDER_ROTATIONS = [
  "what's going on?",
  "write it like a text to a friend.",
  "something happened or might happen?",
  "what feels off?",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDER_ROTATIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 200);
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
      {/* Privacy note — minimal */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 py-1">
        <Lock className="w-3 h-3" />
        <span>nothing saved. closes when you leave.</span>
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-1">
            what's going on?
          </h1>
          <p className="text-muted-foreground text-sm">
            describe the situation. as much or as little as you want.
          </p>
        </div>

        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER_ROTATIONS[placeholderIndex]}
          className="min-h-[140px] resize-none text-base bg-card border-border"
          disabled={isLoading}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground/50">
            {text.length > 0 && `${text.length} / ${maxLength}`}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="px-6"
          >
            continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <button
        onClick={onGuidedMode}
        className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5"
      >
        <ChevronDown className="w-3.5 h-3.5" />
        not sure where to start? try guided mode
      </button>
    </div>
  );
};

export default NarrativeInput;
