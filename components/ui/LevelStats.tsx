"use client";

import { getLevel } from "@/lib/constants/levels";
import { cn } from "@/lib/utils";

interface LevelStatsProps {
  levelId: number;
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function LevelStats({ levelId, label, value, icon, className = "" }: LevelStatsProps) {
  const level = getLevel(levelId);
  
  return (
    <div className={cn(
      "p-4 rounded-xl border",
      level.borderColor,
      level.lightBg,
      className
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`p-2 rounded-lg ${level.bgColor} bg-opacity-20`}>
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className={`text-xl font-bold ${level.textColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}