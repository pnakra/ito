import { Button } from "@/components/ui/button";

interface IntakeChoiceProps<T extends string> {
  heading: string;
  options: { value: T; label: string }[];
  note?: string;
  onSelect: (value: T) => void;
}

/** Single-tap intake question used for role, group part, and witness timing. */
function IntakeChoice<T extends string>({ heading, options, note, onSelect }: IntakeChoiceProps<T>) {
  return (
    <div className="animate-fade-in flex flex-col min-h-[60vh]">
      <div className="space-y-5">
        <h2 className="text-question">{heading}</h2>
        <div className="flex flex-col gap-2.5">
          {options.map((o) => (
            <Button
              key={o.value}
              variant="outline"
              size="lg"
              className="w-full justify-start py-5 text-left whitespace-normal h-auto"
              onClick={() => onSelect(o.value)}
            >
              {o.label}
            </Button>
          ))}
        </div>
        {note && <p className="text-[13px] text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}

export default IntakeChoice;
