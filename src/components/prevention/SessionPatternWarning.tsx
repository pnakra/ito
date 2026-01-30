import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const SessionPatternWarning = () => {
  return (
    <Card className="p-4 border-muted bg-muted/30 animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground text-sm">
          You've been here a few times now. That might mean it's time to slow things down for a bit.
        </p>
      </div>
    </Card>
  );
};

export default SessionPatternWarning;
