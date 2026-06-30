"use client";

import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderCard({
  order,
}: {
  order: any;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-white">
            {order.order_number}
          </h2>

          <p className="mt-2 text-3xl font-bold text-emerald-400">
            ₦{Number(order.total).toLocaleString()}
          </p>

        </div>

        <OrderStatusBadge status={order.status} />

      </div>

      <div className="mt-5 border-t border-slate-800 pt-5">

        <p className="text-slate-400">
          Submitted:
        </p>

        <p className="text-white">
          {new Date(order.created_at).toLocaleDateString()}
        </p>

      </div>

      {order.status === "Approved" && (
        <div className="mt-4 rounded-xl bg-green-500/10 p-4 text-green-400">
          ✅ Points Awarded
        </div>
      )}

      {order.status === "Pending" && (
        <div className="mt-4 rounded-xl bg-yellow-500/10 p-4 text-yellow-400">
          ⏳ Awaiting payment verification.
        </div>
      )}

      {order.status === "Rejected" && (
        <div className="mt-4 rounded-xl bg-red-500/10 p-4 text-red-400">
          ❌ Payment rejected. Please contact support.
        </div>
      )}

    </div>
  );
}
