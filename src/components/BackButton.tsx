import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  to?: string;
  label?: string;
}

const BackButton = ({ to, label = "Back" }: BackButtonProps) => {
  const navigate = useNavigate();

  if (to) {
    return (
      <Link to={to}>
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          {label}
        </Button>
      </Link>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};

export default BackButton;
