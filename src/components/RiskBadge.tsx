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
      className: "bg-accent text-primary border-[1.5px] border-primary",
      disclaimer: null
    },
    yellow: {
      label: "something's off",
      icon: Pause,
      className: "bg-accent text-primary border-[1.5px] border-primary",
      disclaimer: null
    },
    green: {
      label: "you're guessing",
      icon: HelpCircle,
      className: "bg-accent text-primary border-[1.5px] border-primary",
      disclaimer: "this only sees what you typed. only the other person can tell you if something's ok."
    }
  };

  const { label, icon: Icon, className, disclaimer } = config[level];

  if (size === "sm") {
    return (
      <div className={`${className} text-[13px] py-1.5 px-3 rounded-full font-semibold flex items-center gap-1.5`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className={`${className} rounded-full py-2 px-5 font-semibold text-[16px] tracking-[-0.2px] flex items-center gap-2 shadow-badge`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {disclaimer && (
        <p className="text-[13px] text-muted-foreground text-center max-w-xs">
          {disclaimer}
        </p>
      )}
      <p className="text-[13px] text-muted-foreground/70 text-center max-w-[260px]">
        reflection tool, not a ruling. only the other person can give consent.
      </p>
    </div>
  );
};

export default RiskBadge;
