import { Metadata } from "next";
import MembersList from "@/components/admin/members/MembersList";

export const metadata: Metadata = {
  title: "Members | Admin | K-NETWORK",
  description: "Manage members",
};

export default function AdminMembersPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Members Management</h1>
          <p className="mt-1 text-slate-400">View and manage all members</p>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <MembersList />
      </div>
    </div>
  );
}