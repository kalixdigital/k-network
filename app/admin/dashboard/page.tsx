import { Metadata } from "next";
import AdminStats from "@/components/admin/AdminStats";
import RecentOrders from "@/components/admin/RecentOrders";
import QuickActions from "@/components/admin/QuickActions";

export const metadata: Metadata = {
  title: "Dashboard | Admin | K-NETWORK",
  description: "Admin dashboard for K-NETWORK",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">Overview of your K-NETWORK platform</p>
      </div>

      <AdminStats />
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}