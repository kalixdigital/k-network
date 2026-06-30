export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur">

      <div>
        <h1 className="text-xl font-bold text-white">
          K-NETWORK
        </h1>

        <p className="text-xs text-slate-400">
          Member Dashboard
        </p>
      </div>

      <div className="flex items-center gap-3">

        <button className="rounded-full border border-slate-700 p-2">
          🔔
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
          K
        </button>

      </div>

    </header>
  );
}
