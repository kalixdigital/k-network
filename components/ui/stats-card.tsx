import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  value: string;
  label: string;
}

export default function StatsCard({
  icon,
  value,
  label,
}: StatsCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-400">
        {icon}
      </div>

      <h3 className="text-3xl font-bold text-white">
        {value}
      </h3>

      <p className="mt-2 text-slate-400">
        {label}
      </p>
    </div>
  );
}
