import { useState } from "react";

interface Props {
  question: string;
  onSelect: (n: number) => void;
  onSkip: () => void;
}

const PracticeScale = ({ question, onSelect, onSkip }: Props) => {
  const [value, setValue] = useState<number | null>(null);
  return (
    <div className="animate-fade-in flex min-h-[60vh] flex-col">
      <div className="bg-card shadow-card rounded-lg p-5 space-y-4">
        <h2 className="text-h2">{question}</h2>
        <div className="grid grid-cols-5 gap-2.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => {
                if (value !== null) return;
                setValue(n);
                onSelect(n);
              }}
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

export default PracticeScale;
