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
    <div className="border border-border/50 rounded-md p-4 animate-fade-in">
      <h3 className="text-sm font-medium mb-1">Did something already happen?</h3>
      <p className="text-muted-foreground text-sm mb-3">
        If you're thinking you might have already gone too far, there's a different space for that.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/after")}
        className="active:scale-[0.97]"
      >
        Think through what happened
        <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default AfterHandoff;
