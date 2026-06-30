interface SectionTitleProps {
  badge?: string;
  title: string;
  description?: string;
}

export default function SectionTitle({
  badge,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {badge && (
        <span className="inline-flex rounded-full bg-emerald-600/20 px-4 py-2 text-sm font-semibold text-emerald-400">
          {badge}
        </span>
      )}

      <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
