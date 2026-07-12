import { ReactNode } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import { ConfirmDialogProvider } from "@/components/providers/ConfirmDialogProvider";

export default function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-25">
        <div className="relative z-10 w-full overflow-x-hidden">
          <ConfirmDialogProvider>
            {children}
          </ConfirmDialogProvider>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}