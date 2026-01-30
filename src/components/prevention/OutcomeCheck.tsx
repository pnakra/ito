import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, MessageCircle, XCircle, HelpCircle } from "lucide-react";

interface OutcomeCheckProps {
  onSelect: (outcome: string) => void;
}

const outcomes = [
  {
    id: "stopped",
    label: "I stopped",
    icon: CheckCircle,
    className: "hover:border-success hover:bg-success/10"
  },
  {
    id: "checked-in",
    label: "I asked if they were okay",
    icon: MessageCircle,
    className: "hover:border-success hover:bg-success/10"
  },
  {
    id: "didnt-proceed",
    label: "I decided not to do it",
    icon: XCircle,
    className: "hover:border-primary hover:bg-primary/10"
  },
  {
    id: "not-sure",
    label: "I'm not sure / I didn't follow this",
    icon: HelpCircle,
    className: "hover:border-muted-foreground hover:bg-muted"
  }
];

const OutcomeCheck = ({ onSelect }: OutcomeCheckProps) => {
  return (
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          What did you do?
        </h2>
        <p className="text-muted-foreground">
          Just for you to think about. Nothing is saved.
        </p>
      </div>
      
      <div className="grid gap-3">
        {outcomes.map((outcome) => {
          const Icon = outcome.icon;
          
          return (
            <Button
              key={outcome.id}
              variant="outline"
              className={`h-auto py-4 px-5 justify-start border-2 transition-all duration-200 ${outcome.className}`}
              onClick={() => onSelect(outcome.id)}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium">{outcome.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default OutcomeCheck;
