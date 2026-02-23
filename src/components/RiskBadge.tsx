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
      className: "bg-signal-stop/10 text-signal-stop",
      disclaimer: null
    },
    yellow: {
      label: "something's off",
      icon: Pause,
      className: "bg-signal-pause/10 text-signal-pause",
      disclaimer: null
    },
    green: {
      label: "check in with them",
      icon: HelpCircle,
      className: "bg-muted text-muted-foreground",
      disclaimer: "this only sees what you typed. only the other person can tell you if something's ok."
    }
  };

  const { label, icon: Icon, className, disclaimer } = config[level];
  const sizeClasses = size === "lg" 
    ? "text-h2 py-3 px-5" 
    : "text-caption py-1.5 px-3";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${className} ${sizeClasses} rounded-lg font-medium flex items-center justify-center gap-2 shadow-badge animate-scale-in`}>
        <Icon className={size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"} />
        {label}
      </div>
      {disclaimer && size === "lg" && (
        <p className="text-caption text-muted-foreground text-center max-w-xs">
          {disclaimer}
        </p>
      )}
      {size === "lg" && (
        <p className="text-caption text-muted-foreground/70 text-center max-w-[260px] mt-0.5">
          reflection tool, not a ruling. only the other person can give consent.
        </p>
      )}
    </div>
  );
};

export default RiskBadge;
