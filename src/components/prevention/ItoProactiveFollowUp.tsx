import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";

interface ItoProactiveFollowUpProps {
  question: string;
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

const ItoProactiveFollowUp = ({ question, onSubmit, isLoading }: ItoProactiveFollowUpProps) => {
  const [text, setText] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAttention, setShowAttention] = useState(false);
  const maxLength = 1000;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Attention pulse: ~4s after mount, only if user hasn't engaged and
  // prefers-reduced-motion isn't set.
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const t = setTimeout(() => {
      if (!hasInteracted) setShowAttention(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [hasInteracted]);

  const markInteracted = () => {
    if (!hasInteracted) setHasInteracted(true);
    if (showAttention) setShowAttention(false);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    markInteracted();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="animate-fade-in mt-6 space-y-3">
      {/* ito's question — visually distinct, reads as a direct ask */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-foreground text-[12px] font-medium"
            aria-hidden="true"
          >
            ito
          </span>
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground mb-1">
            ito asks
          </p>
          <p
            className="text-foreground text-[16px] leading-snug"
            style={{
              fontFamily: '"Newsreader", "Georgia", serif',
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {question}
          </p>
        </div>
      </div>

      {/* Helper text — first-follow-up only (this component unmounts after submit) */}
      <p className="text-xs text-muted-foreground pl-10">
        ito can go deeper — type anything to keep going.
      </p>

      {/* Input: sticky to bottom on mobile so it stays visible after long responses
          and when the keyboard opens. Static on md+ viewports. */}
      <div
        className={[
          "bg-card shadow-card rounded-[14px] p-4 space-y-3",
          "sticky bottom-2 z-20 md:static md:bottom-auto",
          // Safe-area inset so iOS home indicator doesn't clip it
          "[padding-bottom:calc(1rem+env(safe-area-inset-bottom))] md:[padding-bottom:1rem]",
          // Soft attention: a one-shot gentle fade-in highlight, no looping pulse.
          "transition-shadow duration-700 ease-out motion-reduce:transition-none",
          showAttention ? "ring-1 ring-primary/25" : "ring-0 ring-transparent",
        ].join(" ")}
      >
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            markInteracted();
            setText(e.target.value.slice(0, maxLength));
          }}
          onFocus={markInteracted}
          onClick={markInteracted}
          onKeyDown={handleKeyDown}
          placeholder="share more if you want — ito will factor it in."
          className="min-h-[88px] resize-none border-0 shadow-none p-0 focus-visible:ring-0 text-body"
          style={{ boxShadow: "none" }}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">
            {text.length} / {maxLength}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            size="sm"
            className="h-9 px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Share <ArrowRight className="ml-1 w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItoProactiveFollowUp;
