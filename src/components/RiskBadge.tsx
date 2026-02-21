import { RiskLevel } from "@/types/risk";
import { Hand, Pause, HelpCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "lg";
}

const RiskBadge = ({ level, size = "lg" }: RiskBadgeProps) => {
  const config = {
    red: {
      label: "stop and think",
      icon: Hand,
      className: "bg-signal-stop/15 text-signal-stop border border-signal-stop/30",
      disclaimer: null
    },
    yellow: {
      label: "something's off",
      icon: Pause,
      className: "bg-signal-pause/15 text-signal-pause border border-signal-pause/30",
      disclaimer: null
    },
    green: {
      label: "check in with them",
      icon: HelpCircle,
      className: "bg-muted text-muted-foreground border border-border",
      disclaimer: "this only sees what you typed. only the other person can tell you if something's ok."
    }
  };

  const { label, icon: Icon, className, disclaimer } = config[level];
  const sizeClasses = size === "lg" 
    ? "text-base py-2.5 px-4" 
    : "text-sm py-1.5 px-3";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${className} ${sizeClasses} rounded-md font-medium flex items-center justify-center gap-2 animate-scale-in`}>
        <Icon className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
        {label}
      </div>
      {disclaimer && size === "lg" && (
        <p className="text-xs text-muted-foreground/70 text-center max-w-xs">
          {disclaimer}
        </p>
      )}
      {size === "lg" && (
        <p className="text-[10px] text-muted-foreground/50 text-center max-w-[260px] mt-0.5">
          reflection tool, not a ruling. only the other person can give consent.
        </p>
      )}
    </div>
  );
};

export default RiskBadge;
