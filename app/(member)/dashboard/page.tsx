import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">

      <DashboardHeader />

      <main className="mx-auto max-w-7xl p-6 pb-36">
        <WelcomeCard />
      </main>

      <BottomNavigation />
    </div>
  );
}
