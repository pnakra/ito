import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const PracticeUnder18 = () => (
  <div className="animate-fade-in space-y-6">
    <p className="text-body text-foreground">
      Practice is only for people 18 and older. The main ito is open to you for anything that's on your mind.
    </p>
    <Button asChild size="lg" className="w-full">
      <Link to="/check-in">Go to ito</Link>
    </Button>
  </div>
);

const PracticeGate = ({ onAnswer }: { onAnswer: (adult: boolean) => void }) => (
  <div className="animate-fade-in space-y-6">
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-h2">ito practice</h1>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground border border-border rounded-full px-2 py-0.5">
          Beta
        </span>
      </div>
      <p className="text-body text-foreground">Practice what you'd actually say.</p>
      <p className="text-body text-muted-foreground">
        Short scenes. You type what you'd say, someone answers, and you get a quick debrief after.
      </p>
      <p className="text-body text-muted-foreground">Practice is for people 18 and older.</p>
    </div>
    <div className="space-y-3">
      <Button size="lg" className="w-full" onClick={() => onAnswer(true)}>
        I'm 18 or older
      </Button>
      <Button size="lg" variant="outline" className="w-full" onClick={() => onAnswer(false)}>
        I'm under 18
      </Button>
    </div>
    <p className="text-[13px] text-muted-foreground">
      The other person in each scene is played by AI. Anonymous. Nothing saved that identifies you. Conversations may be reviewed to make practice better.
    </p>
  </div>
);

export default PracticeGate;
