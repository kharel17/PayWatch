import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "orange";
}

export function KPICard({
  title,
  value,
  subtext,
  trend,
  icon,
  color = "blue",
}: KPICardProps) {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-500/10",
    green: "border-green-500 bg-green-500/10",
    red: "border-red-500 bg-red-500/10",
    orange: "border-orange-500 bg-orange-500/10",
  };

  return (
    <div className={`card border-2 ${colorClasses[color]} p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {trend >= 0 ? (
            <ArrowUp className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-400" />
          )}
          <span className={trend >= 0 ? "text-green-400" : "text-red-400"}>
            {Math.abs(trend)}% vs yesterday
          </span>
        </div>
      )}
    </div>
  );
}
