import { Metadata } from "next";
import OrdersList from "@/components/admin/orders/OrdersList";

export const metadata: Metadata = {
  title: "Orders | Admin | K-NETWORK",
  description: "Manage orders",
};

export default function AdminOrdersPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div className="w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Orders Management</h1>
        <p className="mt-1 text-slate-400">View and manage all orders</p>
      </div>

      <div className="w-full overflow-hidden">
        <OrdersList />
      </div>
    </div>
  );
}