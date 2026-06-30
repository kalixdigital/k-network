"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function OrderSummary() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadCart = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("cart_items")
        .select(`
          quantity,
          products(
            id,
            name,
            price
          )
        `)
        .eq("user_id", user.id);

      if (!data) return;

      setItems(data);

      let sum = 0;

      data.forEach((item: any) => {
        sum += Number(item.products.price) * item.quantity;
      });

      setTotal(sum);
    };

    loadCart();
  }, []);

  return (
    <div className="rounded-2xl bg-slate-900 p-6">

      <h2 className="text-2xl font-bold text-white">
        Order Summary
      </h2>

      <div className="mt-6 space-y-4">

        {items.map((item: any) => (
          <div
            key={item.products.id}
            className="flex justify-between"
          >
            <div>
              <p className="text-white">
                {item.products.name}
              </p>

              <p className="text-slate-400">
                Qty: {item.quantity}
              </p>
            </div>

            <p className="font-bold text-emerald-400">
              ₦
              {(
                item.products.price *
                item.quantity
              ).toLocaleString()}
            </p>
          </div>
        ))}

      </div>

      <div className="mt-6 border-t border-slate-700 pt-6 flex justify-between">

        <span className="text-xl text-white">
          Total
        </span>

        <span className="text-2xl font-bold text-emerald-400">
          ₦{total.toLocaleString()}
        </span>

      </div>

    </div>
  );
}
