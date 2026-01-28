import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CrossedLineHandoffProps {
  isActive: boolean;
}

const CrossedLineHandoff = ({ isActive }: CrossedLineHandoffProps) => {
  const navigate = useNavigate();

  if (!isActive) return null;

  return (
    <Card className="p-6 border-muted bg-muted/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-lg font-semibold mb-2">If something already happened</h3>
      <p className="text-muted-foreground mb-4">
        If you're realizing this may have crossed a line already, there's another path focused on reflection and accountability.
      </p>
      <Button
        variant="outline"
        onClick={() => navigate("/crossed-line")}
        className="w-full sm:w-auto"
      >
        Reflect on what happened
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </Card>
  );
};

export default CrossedLineHandoff;
