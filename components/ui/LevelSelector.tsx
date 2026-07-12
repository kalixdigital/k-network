"use client";

import { LEVELS, getLevel } from "@/lib/constants/levels";
import { cn } from "@/lib/utils";

interface LevelSelectorProps {
  selectedLevelId: number;
  onSelect: (levelId: number) => void;
  className?: string;
}

export function LevelSelector({ selectedLevelId, onSelect, className = "" }: LevelSelectorProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {LEVELS.map((level) => (
        <button
          key={level.id}
          onClick={() => onSelect(level.id)}
          className={cn(
            "p-4 rounded-xl border-2 transition-all duration-300 text-center",
            level.borderColor,
            selectedLevelId === level.id 
              ? `${level.bgColor} ${level.textColor} shadow-lg scale-105`
              : `${level.lightBg} hover:${level.hoverBg}`
          )}
        >
          <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${level.bgColor}`} />
          <span className="text-sm font-medium">{level.name}</span>
        </button>
      ))}
    </div>
  );
}