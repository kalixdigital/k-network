"use client";

import { getLevel, getLevelBadgeClasses } from "@/lib/constants/levels";

interface LevelBadgeProps {
  levelId: number;
  showName?: boolean;
  className?: string;
}

export function LevelBadge({ levelId, showName = true, className = "" }: LevelBadgeProps) {
  const level = getLevel(levelId);
  
  return (
    <span className={`${getLevelBadgeClasses(levelId)} ${className}`}>
      {showName ? level.name : `Level ${levelId}`}
    </span>
  );
}