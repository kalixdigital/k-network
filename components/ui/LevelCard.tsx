"use client";

import { getLevel, getLevelCardClasses } from "@/lib/constants/levels";
import { cn } from "@/lib/utils";

interface LevelCardProps {
  levelId: number;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LevelCard({ levelId, children, className = "", onClick }: LevelCardProps) {
  const level = getLevel(levelId);
  
  return (
    <div 
      className={cn(
        "rounded-xl p-6 transition-all duration-300",
        getLevelCardClasses(levelId),
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${level.bgColor}`} />
        <span className={`font-semibold ${level.textColor}`}>
          {level.name}
        </span>
      </div>
      {children}
    </div>
  );
}