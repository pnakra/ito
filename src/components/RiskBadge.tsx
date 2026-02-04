import { RiskLevel } from "@/types/risk";
import { Circle, Hand, Pause, ThumbsUp } from "lucide-react";

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
      icon: ThumbsUp,
      className: "bg-signal-clear/15 text-signal-clear border border-signal-clear/30",
      disclaimer: "This is not permission. Consent must be given freely in the moment."
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
    </div>
  );
};

export default RiskBadge;
