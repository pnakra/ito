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

export type EntryMethod = "typed" | "chip_unedited" | "chip_edited";

interface NarrativeInputProps {
  onSubmit: (text: string, entryMethod: EntryMethod) => void;
  isLoading: boolean;
  compact?: boolean;
  initialValue?: string;
  hideSuggestions?: boolean;
}

const NarrativeInput = ({ onSubmit, isLoading, compact, initialValue, hideSuggestions }: NarrativeInputProps) => {
  const [text, setText] = useState(initialValue ?? "");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Tracks which chip (if any) seeded the textarea. Used to distinguish
  // chip_unedited vs chip_edited submissions for entry-method analytics
  // and to drive the chip-aware proactive follow-up question.
  const seedChipRef = useRef<string | null>(null);
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

  const resolveEntryMethod = (): EntryMethod => {
    const trimmed = text.trim();
    const seed = seedChipRef.current?.trim();
    if (!seed) return "typed";
    if (trimmed === seed) return "chip_unedited";
    return "chip_edited";
  };

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim(), resolveEntryMethod());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipTap = (prompt: string) => {
    seedChipRef.current = prompt;
    setText(prompt);
    // Defer focus + cursor placement until after React paints the new value,
    // otherwise selection range races state and lands at position 0.
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const end = prompt.length;
      try { el.setSelectionRange(end, end); } catch { /* noop */ }
    });
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
          onChange={(e) => {
            // Once the user starts typing, they may diverge from the seed —
            // resolveEntryMethod() handles comparison at submit time.
            setText(e.target.value.slice(0, maxLength));
          }}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="min-h-[100px] resize-none border-0 focus:border-0 shadow-none p-0 focus-visible:ring-0"
          style={{ boxShadow: "none" }}
          disabled={isLoading}
        />

        {/* Chip-seed nudge: visible while the textarea still matches the
            seeded chip text, encouraging the user to personalize before submit. */}
        {seedChipRef.current && text.trim() === seedChipRef.current.trim() && (
          <p className="text-[12px] text-muted-foreground italic animate-fade-in">
            this is a starting point — the more it sounds like your situation, the more useful the reflection
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">anonymous. not linked to you.</span>
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

      {/* Scenario prompts. Tapping a chip seeds the textarea and parks the
          cursor at the end — never auto-submits. Encourages users to add
          one personalizing detail before submitting. */}
      {!text && !isLoading && !hideSuggestions && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center animate-fade-in">
          {[
            "They said yes but something felt off",
            "Should I try to hook up with her when I see her next",
            "Did we only kiss because we were drunk?",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleChipTap(prompt)}
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

      {/* Interactive preview CTA — "terminal analysis stream" */}
      <a
        href="/preview"
        className="group relative mt-4 block w-full max-w-[340px] mx-auto overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-lg transition-all hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="See how ito reads a situation — interactive preview"
      >
        {/* Terminal header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-1.5">
          <div className="flex space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
            ito / preview
          </span>
        </div>

        {/* Terminal body */}
        <div className="space-y-3 p-4">
          {/* Command line with looping typing */}
          <div className="flex items-start gap-2">
            <span className="font-mono text-sm text-primary leading-none mt-1">$</span>
            <span className="font-mono text-[13px] text-muted-foreground leading-tight">
              <span className="ito-preview-typing">read_situation --parse</span>
            </span>
          </div>

          {/* Scenario */}
          <div className="border-l border-border/60 pl-4">
            <p className="font-serif italic text-[15px] leading-snug text-foreground/90">
              "we made out last night but she was pretty drunk. was that okay?"
            </p>
          </div>

          {/* Analysis result */}
          <div className="relative overflow-hidden rounded-md border border-primary/20 bg-primary/[0.06] p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-primary/80">
                analysis ready
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <p className="font-sans text-[13px] text-foreground/80">
              try a vibe:{" "}
              <span className="font-serif italic text-[15px] text-primary">
                direct, warm, or breezy
              </span>
            </p>
            <div className="mt-3 h-0.5 w-full overflow-hidden bg-border/60">
              <div className="ito-preview-slide h-full w-1/3 bg-primary/50" />
            </div>
          </div>

          {/* CTA footer */}
          <div className="flex items-center justify-center pt-1">
            <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-primary transition-transform group-hover:translate-x-1">
              try a scenario →
            </span>
          </div>
        </div>
      </a>

    </div>
  );
};

export default NarrativeInput;
