import { ReactNode } from "react";

export default function ReportsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Reports</h1>
        <p className="mt-1 text-slate-400">View analytics and reports</p>
      </div>

      {children}
    </div>
  );
}