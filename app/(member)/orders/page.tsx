import OrdersList from "@/components/orders/OrdersList";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">

      <div className="mx-auto max-w-6xl px-6 py-10">

        <h1 className="text-4xl font-bold text-white">
          My Orders
        </h1>

        <p className="mt-2 text-slate-400">
          Track your orders and payment verification.
        </p>

        <OrdersList />

      </div>

    </div>
  );
}
