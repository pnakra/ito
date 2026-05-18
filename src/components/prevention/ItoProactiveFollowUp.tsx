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
  const maxLength = 1000;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Don't autofocus — would steal scroll. Just make it ready.
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

      {/* Input is immediately visible below the question */}
      <div className="bg-card shadow-card rounded-[14px] p-4 space-y-3">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
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
