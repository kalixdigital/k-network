interface AuthHeaderProps {
  title: string;
  description: string;
}

export default function AuthHeader({
  title,
  description,
}: AuthHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-3xl">🌿</span>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-3 text-slate-400 leading-7 max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}
