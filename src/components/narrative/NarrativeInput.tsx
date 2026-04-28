import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

const PLACEHOLDER_ROTATIONS = [
  "What's going on?",
  "Write it like you'd text a friend.",
  "Something feel off?",
  "What's on your mind?",
];

interface NarrativeInputProps {
  onSubmit: (text: string) => void;
  onGuidedMode: () => void;
  isLoading: boolean;
  compact?: boolean;
  initialValue?: string;
  hideSuggestions?: boolean;
}

const NarrativeInput = ({ onSubmit, onGuidedMode, isLoading, compact, initialValue, hideSuggestions }: NarrativeInputProps) => {
  const [text, setText] = useState(initialValue ?? "");
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
    <div className={`min-h-[calc(100vh-60px)] flex flex-col justify-start ${compact ? 'pt-4' : 'pt-[2vh]'} animate-fade-in`}>
      <div className="relative inline-flex flex-col items-center mb-2">
        <h1
          className="text-foreground text-center"
          style={{
            fontFamily: '"Newsreader", "Georgia", serif',
            fontSize: '32px',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.3px',
            fontStyle: 'italic',
          }}
        >
          is this ok?
        </h1>
        {/* Hand-drawn underline */}
        <svg
          className="mt-1 text-primary/30"
          width="120"
          height="8"
          viewBox="0 0 120 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 5.5C20 2.5 40 6 60 3.5C80 1 100 5.5 118 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-[14px] text-muted-foreground text-center mb-6" style={{ lineHeight: 1.8 }}>
        a private space to think through dating, sex, and situations that feel off
      </p>

      <div className="bg-card shadow-card rounded-[16px] p-5 space-y-4">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="min-h-[100px] resize-none border-0 focus:border-0 shadow-none p-0 focus-visible:ring-0"
          style={{ boxShadow: "none" }}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground/50">anonymous. not linked to you.</span>
          {showButton ? (
            <div className="animate-fade-in">
              <Button
                onClick={handleSubmit}
                disabled={!text.trim() || isLoading}
                size="sm"
                className="w-auto px-5 h-10"
              >
                Go <ArrowRight className="ml-1 w-3.5 h-3.5" />
              </Button>
            </div>
          ) : <div />}
        </div>
      </div>

      {/* Scenario prompts */}
      {!text && !isLoading && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center animate-fade-in">
          {[
            "They said yes but something felt off",
            "I'm not sure if I went too far",
            "They haven't texted back and I'm overthinking it",
            "I don't know if what happened was okay",
            "Things got further than I expected and I feel weird about it",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setText(prompt)}
              className="text-[14px] text-muted-foreground bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] hover:text-foreground px-3.5 py-2 rounded-[10px] transition-colors text-center leading-snug"
            >
              {prompt}
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
      <div className="mt-3 flex flex-col items-center gap-3">
        <button
          onClick={onGuidedMode}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Not sure what to say? <span className="text-primary font-medium">Try guided questions</span>
        </button>
      </div>
    </div>
  );
};

export default NarrativeInput;
