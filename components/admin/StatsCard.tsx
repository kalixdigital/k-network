"use client";

import { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "emerald" | "blue" | "purple" | "amber" | "red" | "pink";
  trend?: {
    value: number;
    isPositive: boolean;
  };
};

export default function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  // ✅ Debug: Check if Icon is defined
  if (!Icon) {
    console.error("StatsCard: Icon is undefined for", title);
    return (
      <div className={`rounded-2xl border p-6 bg-slate-900/50 border-slate-800`}>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      </div>
    );
  }

  const colorClasses = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    red: "border-red-500/20 bg-red-500/10 text-red-400",
    pink: "border-pink-500/20 bg-pink-500/10 text-pink-400",
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
      {trend && (
        <p className={`mt-2 text-xs ${trend.isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
        </p>
      )}
    </div>
  );
}