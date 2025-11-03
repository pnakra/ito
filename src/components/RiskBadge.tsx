import { RiskLevel } from "@/data/scenarios";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "lg";
}

const RiskBadge = ({ level, size = "lg" }: RiskBadgeProps) => {
  const config = {
    red: {
      label: "RED FLAG",
      icon: AlertTriangle,
      className: "bg-destructive text-destructive-foreground"
    },
    yellow: {
      label: "YELLOW FLAG",
      icon: AlertCircle,
      className: "bg-warning text-warning-foreground"
    },
    green: {
      label: "GREEN FLAG",
      icon: CheckCircle,
      className: "bg-success text-success-foreground"
    }
  };

  const { label, icon: Icon, className } = config[level];
  const sizeClasses = size === "lg" ? "text-2xl py-4 px-6" : "text-sm py-2 px-3";

  return (
    <div className={`${className} ${sizeClasses} rounded-lg font-bold flex items-center justify-center gap-2`}>
      <Icon className={size === "lg" ? "w-6 h-6" : "w-4 h-4"} />
      {label}
    </div>
  );
};

export default RiskBadge;
