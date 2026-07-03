"use client";

import { Trophy, Star } from "lucide-react";

type Props = {
  level: number;
  currentPoints: number;
};

const LEVELS = [
  { level: 1, points: 0, label: "Beginner" },
  { level: 2, points: 100, label: "Bronze" },
  { level: 3, points: 300, label: "Silver" },
  { level: 4, points: 500, label: "Gold" },
  { level: 5, points: 850, label: "Platinum" },
  { level: 6, points: 1100, label: "Diamond" },
];

export default function LevelProgress({ level, currentPoints }: Props) {
  const currentLevel = LEVELS.find((l) => l.level === level);
  const nextLevel = LEVELS.find((l) => l.level === level + 1);

  if (!currentLevel) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center">
        <Trophy className="mx-auto h-12 w-12 text-emerald-400" />
        <h3 className="mt-3 text-xl font-bold text-white">Level {level}</h3>
        <p className="text-slate-400">Invalid level configuration</p>
      </div>
    );
  }

  if (!nextLevel) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 p-6 text-center">
        <Trophy className="mx-auto h-12 w-12 text-emerald-400" />
        <h3 className="mt-3 text-2xl font-bold text-white">
          🎉 Max Level Reached!
        </h3>
        <p className="mt-2 text-emerald-400">You are a {currentLevel.label}</p>
        <p className="mt-1 text-sm text-slate-400">
          Level {level} • {currentPoints} total points
        </p>
      </div>
    );
  }

  const pointsToNext = nextLevel.points - currentPoints;
  const percent = Math.min((currentPoints / nextLevel.points) * 100, 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Level Progress</h3>
            <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-400">
              Level {level}
            </span>
          </div>
          <p className="text-sm text-slate-400">{currentLevel.label}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Next Level</p>
          <p className="text-lg font-semibold text-emerald-400">
            {nextLevel.label}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>{currentPoints} pts</span>
        <span>{nextLevel.points} pts</span>
      </div>

      <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-emerald-400">
          {pointsToNext > 0
            ? `Need ${pointsToNext} more points to reach ${nextLevel.label}`
            : "Ready for next level!"}
        </p>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-slate-400">{currentPoints} total</span>
        </div>
      </div>
    </div>
  );
}