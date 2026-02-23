import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Lock } from "lucide-react";

const PLACEHOLDER_ROTATIONS = [
  "What's going on?",
  "Write it like a text to a friend.",
  "Something happened or might happen?",
  "What feels off?",
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
    <div className="space-y-6 animate-fade-in">
      {/* Privacy note */}
      <div className="flex items-center justify-center gap-2 text-caption text-muted-foreground py-1">
        <Lock className="w-3 h-3" />
        <span>Nothing saved. Closes when you leave.</span>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-h1 mb-2">
            What's going on?
          </h1>
          <p className="text-muted-foreground text-body">
            Describe the situation. As much or as little as you want.
          </p>
        </div>

        <div className="bg-card shadow-card rounded-lg p-6">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_ROTATIONS[placeholderIndex]}
            className="min-h-[140px] resize-none text-body border-input"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-caption text-muted-foreground">
            {text.length > 0 && `${text.length} / ${maxLength}`}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="px-6"
          >
            Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <button
        onClick={onGuidedMode}
        className="w-full flex items-center justify-center gap-1.5 text-caption text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        Not sure where to start? <span className="text-primary font-medium">Try guided mode</span>
      </button>
    </div>
  );
};

export default NarrativeInput;
