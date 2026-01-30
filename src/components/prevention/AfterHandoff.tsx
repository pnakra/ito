import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface AfterHandoffProps {
  isActive: boolean;
}

const AfterHandoff = ({ isActive }: AfterHandoffProps) => {
  const navigate = useNavigate();

  if (!isActive) return null;

  return (
    <Card className="p-5 border-border/50 bg-muted/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-base font-medium mb-2">Did something already happen?</h3>
      <p className="text-muted-foreground text-sm mb-4">
        If you're thinking you might have already gone too far, there's a different space for that.
      </p>
      <Button
        variant="outline"
        onClick={() => navigate("/after")}
        className="w-full sm:w-auto"
      >
        Think through what happened
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </Card>
  );
};

export default AfterHandoff;
