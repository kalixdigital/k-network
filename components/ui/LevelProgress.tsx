"use client";

import { getLevel } from "@/lib/constants/levels";

interface LevelProgressProps {
  currentLevelId: number;
  nextLevelId?: number;
  progress: number; // 0-100
  showLabels?: boolean;
  className?: string;
}

export function LevelProgress({ 
  currentLevelId, 
  nextLevelId, 
  progress, 
  showLabels = true,
  className = ""
}: LevelProgressProps) {
  const currentLevel = getLevel(currentLevelId);
  const nextLevel = nextLevelId ? getLevel(nextLevelId) : null;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm mb-2">
        {showLabels && (
          <>
            <span className={currentLevel.textColor}>
              {currentLevel.name}
            </span>
            {nextLevel && (
              <span className={nextLevel.textColor}>
                {nextLevel.name}
              </span>
            )}
          </>
        )}
      </div>
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${currentLevel.bgColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs mt-1">
          <span className="text-slate-500">0%</span>
          <span className="text-slate-500">{Math.min(progress, 100)}%</span>
          <span className="text-slate-500">100%</span>
        </div>
      )}
    </div>
  );
}