import { RiskLevel } from "@/types/risk";
import { Hand, Pause, HelpCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "lg";
}

const RiskBadge = ({ level, size = "lg" }: RiskBadgeProps) => {
  const config = {
    red: {
      label: "Stop and think",
      icon: Hand,
      className: "bg-accent text-primary border-[1.5px] border-primary",
      disclaimer: null
    },
    yellow: {
      label: "Something's off",
      icon: Pause,
      className: "bg-accent text-primary border-[1.5px] border-primary",
      disclaimer: null
    },
    green: {
      label: "No flag",
      icon: HelpCircle,
      className: "bg-muted text-muted-foreground border-[1.5px] border-border",
      disclaimer: "The absence of a red flag is not the presence of consent. Only the other person can tell you what they want."
    }
  };

  const { label, icon: Icon, className, disclaimer } = config[level];

  if (size === "sm") {
    return (
      <div className={`${className} text-[13px] py-1.5 px-3 rounded-full font-semibold inline-flex items-center gap-1.5 leading-none`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className={`${className} rounded-full py-2 px-5 font-semibold text-[16px] tracking-[-0.2px] inline-flex items-center gap-2 shadow-badge leading-none`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="leading-tight">{label}</span>
      </div>
      {disclaimer && (
        <p className="text-[13px] text-muted-foreground text-center max-w-xs">
          {disclaimer}
        </p>
      )}
      <p className="text-[13px] text-muted-foreground/70 text-center max-w-[260px]">
        This is a reflection tool, not a ruling. Only the other person can give consent.
      </p>
    </div>
  );
};

export default RiskBadge;
