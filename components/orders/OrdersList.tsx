"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import OrderCard from "./OrderCard";

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
    };

    loadOrders();
  }, []);

  if (orders.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-slate-900 p-10 text-center text-slate-400">
        You haven't placed any orders yet.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
        />
      ))}
    </div>
  );
}
