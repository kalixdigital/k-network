"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import StatusBadge from "./StatusBadge";

type Order = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  user_id: string;
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Recent Orders</h2>
        <Link
          href="/admin/orders"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-4 text-center text-slate-400">No orders yet</p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4"
            >
              <div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-white hover:text-emerald-400"
                >
                  {order.order_number}
                </Link>
                <p className="text-sm text-slate-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400">
                  ₦{order.total.toLocaleString()}
                </p>
                <StatusBadge status={order.status} type="order" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}