import { ReactNode } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BottomNavigation from "@/components/dashboard/BottomNavigation";

export default function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">

      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28">

        {children}

      </main>

      <BottomNavigation />

    </div>
  );
}
