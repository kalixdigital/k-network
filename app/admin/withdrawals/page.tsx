import { Metadata } from "next";
import WithdrawalsList from "@/components/admin/withdrawals/WithdrawalsList";

export const metadata: Metadata = {
  title: "Withdrawals | Admin | K-NETWORK",
  description: "Manage withdrawal requests",
};

export default function AdminWithdrawalsPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Withdrawals</h1>
        <p className="mt-1 text-slate-400">Manage withdrawal requests from members</p>
      </div>

      <div className="w-full overflow-hidden">
        <WithdrawalsList />
      </div>
    </div>
  );
}