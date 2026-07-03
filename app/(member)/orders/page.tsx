import { Metadata } from "next";
import OrdersList from "@/components/orders/OrdersList";

export const metadata: Metadata = {
  title: "My Orders | K-NETWORK",
  description: "Track your orders and payment verification",
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            My Orders
          </h1>
          <p className="mt-2 text-slate-400">
            Track your orders and payment verification
          </p>
        </div>

        <OrdersList />
      </div>
    </div>
  );
}