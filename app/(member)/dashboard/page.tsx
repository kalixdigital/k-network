import WelcomeCard from "@/components/dashboard/WelcomeCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WelcomeCard />
      </main>
    </div>
  );
}