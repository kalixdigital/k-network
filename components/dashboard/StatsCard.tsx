type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatsCard({
  title,
  value,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-white">
        {value}
      </h2>

      {subtitle && (
        <p className="mt-2 text-sm text-emerald-400">
          {subtitle}
        </p>
      )}

    </div>
  );
}
