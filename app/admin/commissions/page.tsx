import { Metadata } from "next";
import CommissionsOverview from "@/components/admin/commissions/CommissionsOverview";

export const metadata: Metadata = {
  title: "Commissions | Admin | K-NETWORK",
  description: "View commission overview and payouts",
};

export default function AdminCommissionsPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Commissions</h1>
        <p className="mt-1 text-slate-400">View commission overview and payouts</p>
      </div>

      <div className="w-full overflow-hidden">
        <CommissionsOverview />
      </div>
    </div>
  );
}