"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getLevel, getLevelName } from "@/lib/constants/levels";

type Props = {
  level: number;
  currentPoints: number;
};

type LevelData = {
  id: number;
  name: string;
  min_monthly_points: number;
  min_active_direct_referrals: number;
};

// Get background color based on level
const getLevelBg = (level: number): string => {
  switch (level) {
    case 1:
      return "bg-emerald-950/30 border-emerald-500/20";
    case 2:
      return "bg-blue-950/30 border-blue-500/20";
    case 3:
      return "bg-purple-950/30 border-purple-500/20";
    case 4:
      return "bg-yellow-950/30 border-yellow-500/20";
    case 5:
      return "bg-orange-950/30 border-orange-500/20";
    case 6:
      return "bg-cyan-950/30 border-cyan-500/20";
    default:
      return "bg-slate-900/50 border-slate-800";
  }
};

// Get progress bar color based on percentage
const getProgressBarColor = (percent: number, levelColor: string) => {
  // Use the level's color with different intensities based on progress
  if (percent < 39) {
    return {
      gradient: `from-${levelColor}-600 to-${levelColor}-500`,
      glow: `shadow-${levelColor}-500/20`,
      text: `text-${levelColor}-400`,
    };
  } else if (percent < 69) {
    return {
      gradient: `from-${levelColor}-500 to-${levelColor}-400`,
      glow: `shadow-${levelColor}-500/30`,
      text: `text-${levelColor}-400`,
    };
  } else {
    return {
      gradient: `from-${levelColor}-500 to-${levelColor}-400`,
      glow: `shadow-${levelColor}-400/40`,
      text: `text-${levelColor}-400`,
    };
  }
};

export default function LevelProgress({ level, currentPoints }: Props) {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      const { data, error } = await supabase
        .from("membership_levels")
        .select("id, name, min_monthly_points, min_active_direct_referrals")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error loading levels:", error);
        setLoading(false);
        return;
      }

      setLevels(data || []);
    } catch (error) {
      console.error("Error loading levels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur md:p-6">
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  // Find current level and next level from database
  const currentLevelData = levels.find((l) => l.id === level);
  const nextLevelData = levels.find((l) => l.id === level + 1);

  if (!currentLevelData || !nextLevelData) {
    // Fallback if database levels not found
    const currentLevel = getLevel(level);
    const nextLevel = getLevel(level + 1);
    
    if (!currentLevel || !nextLevel) {
      return null;
    }

    const percent = Math.min((currentPoints / 100) * 100, 100);
    const bgColor = getLevelBg(level);
    const levelColor = nextLevel.bgColor.replace('bg-', '').replace('-500', '');
    const progressColor = getProgressBarColor(percent, levelColor);

    return (
      <div className={`rounded-2xl border ${bgColor} p-4 shadow-xl backdrop-blur md:p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${nextLevel.bgColor}`} />
            <span className={`text-lg font-bold md:text-xl ${nextLevel.textColor}`}>
              {nextLevel.name}
            </span>
          </div>
          <span className={`text-lg font-bold ${progressColor.text}`}>
            {Math.round(percent)}%
          </span>
        </div>
        <div className="mt-3">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor.gradient} transition-all duration-1000 shadow-lg ${progressColor.glow}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current: {currentPoints} pts
          </span>
          <span className="text-xs text-slate-500">
            Target: {nextLevelData?.min_monthly_points || 100} pts
          </span>
        </div>
      </div>
    );
  }

  const percent = Math.min(
    (currentPoints / nextLevelData.min_monthly_points) * 100,
    100
  );
  
  // Get the next level's color from reusable system
  const nextLevel = getLevel(level + 1);
  const bgColor = getLevelBg(level);
  
  // Extract the color name from the bgColor class (e.g., "emerald" from "bg-emerald-500")
  const levelColor = nextLevel.bgColor.replace('bg-', '').replace('-500', '');
  const progressColor = getProgressBarColor(percent, levelColor);

  return (
    <div className={`rounded-2xl border ${bgColor} p-4 shadow-xl backdrop-blur md:p-6`}>
      {/* Next Level Name + Color Dot + Percentage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${nextLevel.bgColor}`} />
          <span className={`text-lg font-bold md:text-xl ${nextLevel.textColor}`}>
            {nextLevelData.name}
          </span>
        </div>
        <span className={`text-lg font-bold ${progressColor.text}`}>
          {Math.round(percent)}%
        </span>
      </div>

      {/* Progress Bar - Uses Next Level's Color */}
      <div className="mt-3">
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor.gradient} transition-all duration-1000 shadow-lg ${progressColor.glow}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Points Progress */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Current: {currentPoints} pts
        </span>
        <span className="text-xs text-slate-500">
          Target: {nextLevelData.min_monthly_points} pts
        </span>
      </div>
    </div>
  );
}