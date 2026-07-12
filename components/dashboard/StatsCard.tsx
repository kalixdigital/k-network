"use client";

import { ReactNode } from "react";
import { getLevel, getLevelName } from "@/lib/constants/levels";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  level?: number;
};

// Get color schemes based on membership level using the reusable system
const getLevelColors = (level: number = 1) => {
  const levelData = getLevel(level);
  
  switch (level) {
    case 1:
      return {
        border: "border-emerald-500/50 hover:border-emerald-400",
        bg: "bg-emerald-950/20",
        glow: "hover:shadow-emerald-500/10",
        accent: "text-emerald-400",
        badge: "bg-emerald-700/30 text-emerald-300",
      };
    case 2:
      return {
        border: "border-blue-500/50 hover:border-blue-400",
        bg: "bg-blue-950/20",
        glow: "hover:shadow-blue-500/10",
        accent: "text-blue-400",
        badge: "bg-blue-700/30 text-blue-300",
      };
    case 3:
      return {
        border: "border-purple-500/50 hover:border-purple-400",
        bg: "bg-purple-950/20",
        glow: "hover:shadow-purple-500/10",
        accent: "text-purple-400",
        badge: "bg-purple-700/30 text-purple-300",
      };
    case 4:
      return {
        border: "border-yellow-500/50 hover:border-yellow-400",
        bg: "bg-yellow-950/20",
        glow: "hover:shadow-yellow-500/10",
        accent: "text-yellow-400",
        badge: "bg-yellow-700/30 text-yellow-300",
      };
    case 5:
      return {
        border: "border-orange-500/50 hover:border-orange-400",
        bg: "bg-orange-950/20",
        glow: "hover:shadow-orange-500/10",
        accent: "text-orange-400",
        badge: "bg-orange-700/30 text-orange-300",
      };
    case 6:
      return {
        border: "border-cyan-500/50 hover:border-cyan-400",
        bg: "bg-cyan-950/20",
        glow: "hover:shadow-cyan-500/10",
        accent: "text-cyan-400",
        badge: "bg-cyan-700/30 text-cyan-300",
      };
    default:
      return {
        border: "border-emerald-500/50 hover:border-emerald-400",
        bg: "bg-emerald-950/20",
        glow: "hover:shadow-emerald-500/10",
        accent: "text-emerald-400",
        badge: "bg-emerald-700/30 text-emerald-300",
      };
  }
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  level = 1,
}: StatsCardProps) {
  const colors = getLevelColors(level);
  const levelName = getLevelName(level);
  const levelData = getLevel(level);

  return (
    <div
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 shadow-xl backdrop-blur transition-all ${colors.glow}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-slate-400">{title}</p>
            {title === "Membership Level" && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.badge}`}>
                {levelName}
              </span>
            )}
          </div>
          <p className="mt-1 text-lg font-bold text-white truncate">
            {title === "Membership Level" ? levelName : value}
          </p>
          {subtitle && (
            <p className={`mt-0.5 text-[10px] ${colors.accent}`}>{subtitle}</p>
          )}
          {trend && (
            <p
              className={`mt-1 text-[10px] font-medium ${
                trend.isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="flex-shrink-0 text-2xl">{icon}</div>}
      </div>
    </div>
  );
}