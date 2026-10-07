import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PracticeDebrief } from "./types";

interface Props {
  debrief: PracticeDebrief | null;
  error: boolean;
  onRetry: () => void;
  onAgain: () => void;
  onAnother: () => void;
  onDone: () => void;
}

const List = ({ title, items }: { title: string; items: string[] }) =>
  items.length === 0 ? null : (
    <div className="space-y-2">
      <h3 className="text-body font-medium text-foreground">{title}</h3>
      <ul className="list-disc pl-5 space-y-1.5 text-body text-muted-foreground">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );

const PracticeDebriefView = ({ debrief, error, onRetry, onAgain, onAnother, onDone }: Props) => {
  if (error) {
    return (
      <div className="animate-fade-in space-y-3">
        <p className="text-body text-muted-foreground">The debrief didn't load.</p>
        <Button variant="outline" onClick={onRetry}>Try again</Button>
      </div>
    );
  }
  if (!debrief) {
    return (
      <div className="animate-fade-in flex items-center gap-3 text-muted-foreground text-body">
        <Loader2 className="w-4 h-4 animate-spin" />
        Putting your debrief together...
      </div>
    );
  }
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-h2">{debrief.headline}</h2>
      <List title="What worked" items={debrief.did_well ?? []} />
      <List title="What to work on" items={debrief.missed ?? []} />
      {debrief.try_next && (
        <div className="bg-card shadow-card rounded-lg p-5 space-y-2">
          <p className="text-[13px] text-muted-foreground">Try this next time</p>
          <p className="text-body text-foreground">"{debrief.try_next}"</p>
        </div>
      )}
      <div className="space-y-3">
        <Button size="lg" className="w-full" onClick={onAgain}>Try this scene again</Button>
        <Button size="lg" variant="outline" className="w-full" onClick={onAnother}>Pick another scene</Button>
        <Button size="lg" variant="outline" className="w-full" onClick={onDone}>I'm done</Button>
      </div>
    </div>
  );
};

export default PracticeDebriefView;
