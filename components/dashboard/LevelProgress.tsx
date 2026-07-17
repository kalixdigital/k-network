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

// Get progress bar color based on percentage - Using direct color mapping
const getProgressBarStyles = (percent: number, level: number) => {
  // Map level to actual color classes
  const colorMap: Record<number, { from: string; to: string; glow: string; text: string }> = {
    1: { from: 'from-emerald-600', to: 'to-emerald-400', glow: 'shadow-emerald-500/20', text: 'text-emerald-400' },
    2: { from: 'from-blue-600', to: 'to-blue-400', glow: 'shadow-blue-500/20', text: 'text-blue-400' },
    3: { from: 'from-purple-600', to: 'to-purple-400', glow: 'shadow-purple-500/20', text: 'text-purple-400' },
    4: { from: 'from-yellow-600', to: 'to-yellow-400', glow: 'shadow-yellow-500/20', text: 'text-yellow-400' },
    5: { from: 'from-orange-600', to: 'to-orange-400', glow: 'shadow-orange-500/20', text: 'text-orange-400' },
    6: { from: 'from-cyan-600', to: 'to-cyan-400', glow: 'shadow-cyan-500/20', text: 'text-cyan-400' },
  };

  // Default to emerald if level not found
  const colors = colorMap[level] || colorMap[1];

  return {
    gradient: `${colors.from} ${colors.to}`,
    glow: colors.glow,
    text: colors.text,
  };
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

  // Get the level colors from the reusable system
  const nextLevel = getLevel(level + 1);
  const currentLevel = getLevel(level);
  const bgColor = getLevelBg(level);

  // If no next level, we're at max level
  if (!nextLevel || !nextLevelData) {
    return (
      <div className={`rounded-2xl border ${bgColor} p-4 shadow-xl backdrop-blur md:p-6`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${currentLevel.bgColor}`} />
          <span className={`text-lg font-bold md:text-xl ${currentLevel.textColor}`}>
            Maximum Level Reached! 🏆
          </span>
        </div>
        <div className="mt-3">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-${currentLevel.bgColor.replace('bg-', '')} to-${currentLevel.bgColor.replace('bg-', '')} transition-all duration-1000 shadow-lg shadow-${currentLevel.bgColor.replace('bg-', '')}/20`}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current: {currentPoints} pts
          </span>
          <span className="text-xs text-slate-500">
            👑 Max Level
          </span>
        </div>
      </div>
    );
  }

  // ✅ Now nextLevelData is guaranteed to exist
  const percent = Math.min(
    (currentPoints / nextLevelData.min_monthly_points) * 100,
    100
  );
  
  const progressColor = getProgressBarStyles(percent, level + 1);

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