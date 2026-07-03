"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import OrderCard from "./OrderCard";
import { Package, ShoppingBag } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  total: number;
  total_points: number;
  status: string;
  payment_status: string;
  member_id: string;
  payment_proof: string | null;
  notes: string | null;
  created_at: string;
};

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User fetch error:", userError);
        showToast.error("Please login to view your orders");
        router.push("/login");
        setLoading(false);
        return;
      }

      if (!user) {
        router.push("/login");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            points_earned,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Orders fetch error:", error);
        showToast.error("Failed to load orders");
        setLoading(false);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      showToast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center rounded-2xl bg-slate-900/50 p-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
          <p className="mt-4 text-slate-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <div className="flex justify-center">
          <ShoppingBag className="h-16 w-16 text-slate-600" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">
          No orders yet
        </h3>
        <p className="mt-2 text-slate-400">
          You haven't placed any orders. Start shopping to see your orders here.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
        >
          <Package className="h-4 w-4" />
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Showing {orders.length} order{orders.length > 1 ? "s" : ""}
        </p>
        <button
          onClick={loadOrders}
          className="text-sm text-emerald-400 transition hover:text-emerald-300"
        >
          Refresh
        </button>
      </div>

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}