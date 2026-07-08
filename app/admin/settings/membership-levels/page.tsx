import { Metadata } from "next";
import MembershipLevelsManager from "@/components/admin/settings/MembershipLevelsManager";

export const metadata: Metadata = {
  title: "Membership Levels | Admin | K-NETWORK",
  description: "Manage membership levels",
};

export default function MembershipLevelsPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Membership Levels</h1>
        <p className="mt-1 text-slate-400">Configure membership levels, requirements, and benefits</p>
      </div>

      <MembershipLevelsManager />
    </div>
  );
}