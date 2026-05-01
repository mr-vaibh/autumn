import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  color?: "purple" | "blue" | "green" | "orange" | "red" | "yellow";
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-neutral-200 p-6 card-hover", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-3xl font-bold mt-1 text-black">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.positive ? "text-green-600" : "text-red-600")}>
              <span>{trend.positive ? "+" : "-"}{Math.abs(trend.value)}%</span>
              <span className="text-neutral-400 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
