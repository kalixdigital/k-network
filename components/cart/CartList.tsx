"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import CartItem from "./CartItem";

export default function CartList() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq("user_id", user.id);

      setItems(data || []);
    };

    loadCart();
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}
