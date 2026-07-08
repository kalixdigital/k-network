import { Metadata } from "next";
import MembershipSettings from "@/components/admin/settings/MembershipSettings";

export const metadata: Metadata = {
  title: "Membership Settings | Admin | K-NETWORK",
  description: "Configure membership settings",
};

export default function MembershipPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Membership Settings</h1>
        <p className="mt-1 text-slate-400">Configure membership system behavior</p>
      </div>

      <MembershipSettings />
    </div>
  );
}