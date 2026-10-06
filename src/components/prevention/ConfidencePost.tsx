import { useState } from "react";

interface ConfidencePostProps {
  onSelect: (value: number) => void;
  onSkip: () => void;
  confidencePre: number | null;
}

const CONFIDENCE_SCALE = [1, 2, 3, 4, 5];

const ConfidencePost = ({ onSelect, onSkip, confidencePre }: ConfidencePostProps) => {
  const [value, setValue] = useState<number | null>(null);

  const handleSelect = (n: number) => {
    if (value !== null) return;
    setValue(n);
    onSelect(n);
  };

  return (
    <div className="animate-fade-in flex min-h-[60vh] flex-col">
      <div className="flex justify-end mb-6">
        <span className="text-[13px] text-muted-foreground">1 of 2</span>
      </div>
      <div className="bg-card shadow-card rounded-lg p-5 space-y-4">
        <h2 className="text-h2">
          {confidencePre !== null
            ? `You said ${confidencePre} out of 5 before. How sure are you now about what to do?`
            : "How sure are you now about what to do?"}
        </h2>
        <div className="grid grid-cols-5 gap-2.5">
          {CONFIDENCE_SCALE.map(n => (
            <button
              key={n}
              onClick={() => handleSelect(n)}
              className={`min-h-[48px] rounded-[10px] text-[14px] transition-all duration-150 active:scale-[0.97] ${
                value === n
                  ? "bg-accent border-[1.5px] border-primary text-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80 border-[1.5px] border-transparent"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[13px] text-muted-foreground">
          <span>Not sure at all</span>
          <span>Very sure</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-5 self-center text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip
      </button>
    </div>
  );
};

export default ConfidencePost;
