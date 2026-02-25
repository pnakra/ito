import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

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
  compact?: boolean;
}

const NarrativeInput = ({ onSubmit, onGuidedMode, isLoading, compact }: NarrativeInputProps) => {
  const [text, setText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 3000;
  const minChars = 10;

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

  const showButton = text.trim().length >= minChars;

  return (
    <div className={`min-h-[calc(100vh-60px)] flex flex-col justify-start ${compact ? 'pt-6' : 'pt-[15vh]'} animate-fade-in`}>
      <h1 className="text-h1 mb-6 text-foreground text-center">is this ok?</h1>

      <div className="bg-card shadow-card rounded-[16px] p-5 space-y-4">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="min-h-[140px] resize-none border-0 focus:border-0 shadow-none p-0 focus-visible:ring-0"
          style={{ boxShadow: "none" }}
          disabled={isLoading}
        />

        {showButton && (
          <div className="flex justify-end animate-fade-in">
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              size="sm"
              className="w-auto px-5 h-10"
            >
              Continue <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Scenario prompts */}
      {!text && !isLoading && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center animate-fade-in">
          {[
            "She said yes earlier but now she seems off",
            "I keep thinking about whether I pushed too hard",
            "We've hooked up before but this time felt different",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setText(prompt)}
              className="text-[13px] text-muted-foreground bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] hover:text-foreground px-3.5 py-2 rounded-[10px] transition-colors text-left leading-snug"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      )}

      {/* Loading dots */}
      {isLoading && (
        <div className="flex justify-center gap-1.5 mt-6">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      )}

      {/* Privacy + guided mode */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-[13px] text-muted-foreground">
          Private and anonymous — nothing is saved.
        </p>

        <button
          onClick={onGuidedMode}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Not sure where to start? <span className="text-primary font-medium">Answer a few questions</span>
        </button>
      </div>
    </div>
  );
};

export default NarrativeInput;
