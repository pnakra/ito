import { RiskLevel } from "@/types/risk";
import { Hand, Pause, HelpCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "lg";
}

const RiskBadge = ({ level, size = "lg" }: RiskBadgeProps) => {
  const config = {
    red: {
      label: "Hard Stop",
      icon: Hand,
      className: "bg-signal-stop/15 text-signal-stop border border-signal-stop/30",
      disclaimer: null
    },
    yellow: {
      label: "Pause & Check",
      icon: Pause,
      className: "bg-signal-pause/15 text-signal-pause border border-signal-pause/30",
      disclaimer: null
    },
    green: {
      label: "No flags detected",
      icon: HelpCircle,
      className: "bg-muted text-muted-foreground border border-border/50",
      disclaimer: "The absence of a red flag is not the presence of consent. This tool cannot see what's actually happening."
    }
  };

  const { label, icon: Icon, className, disclaimer } = config[level];
  const sizeClasses = size === "lg" 
    ? "text-lg py-3 px-5" 
    : "text-sm py-1.5 px-3";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${className} ${sizeClasses} rounded-full font-medium flex items-center justify-center gap-2 animate-scale-in`}>
        <Icon className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} />
        {label}
      </div>
      {disclaimer && size === "lg" && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          {disclaimer}
        </p>
      )}
      {size === "lg" && (
        <p className="text-[10px] text-muted-foreground/70 text-center max-w-[280px] mt-1">
          This is a reflection tool, not a legal or moral ruling. Only the other person can give consent.
        </p>
      )}
    </div>
  );
};

export default RiskBadge;
