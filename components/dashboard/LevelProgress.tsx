type Props = {
  level: number;
  currentPoints: number;
};

const LEVELS = [
  { level: 1, points: 0 },
  { level: 2, points: 100 },
  { level: 3, points: 300 },
  { level: 4, points: 500 },
  { level: 5, points: 850 },
  { level: 6, points: 1100 },
];

export default function LevelProgress({
  level,
  currentPoints,
}: Props) {
  const next = LEVELS.find((l) => l.level === level + 1);

  if (!next) {
    return (
      <div className="rounded-3xl border border-emerald-500 bg-slate-900 p-6">
        <h3 className="text-xl font-bold text-white">
          🎉 Highest Level Reached
        </h3>
      </div>
    );
  }

  const percent = Math.min(
    (currentPoints / next.points) * 100,
    100
  );

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          Level Progress
        </h3>

        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
          Level {level}
        </span>
      </div>

      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />

      </div>

      <div className="mt-4 flex justify-between text-sm text-slate-400">
        <span>{currentPoints} Points</span>
        <span>{next.points} Points</span>
      </div>

      <p className="mt-4 text-emerald-400">
        Need {next.points - currentPoints} more points to reach Level {next.level}.
      </p>

    </div>
  );
}
