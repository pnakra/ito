import { AlertCircle } from "lucide-react";

const SessionPatternWarning = () => {
  return (
    <div className="flex items-start gap-3 p-3 border border-muted rounded-md bg-muted/20 animate-fade-in">
      <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <p className="text-muted-foreground text-sm">
        You've been here a few times now. That might mean it's time to slow things down for a bit.
      </p>
    </div>
  );
};

export default SessionPatternWarning;
