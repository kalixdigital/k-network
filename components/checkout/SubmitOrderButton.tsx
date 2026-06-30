"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SubmitOrderButton({
  receiptPath,
}: {
  receiptPath: string;
}) {
  const router = useRouter();

  const submitOrder = async () => {

    if (!receiptPath) {
      alert("Please upload your payment receipt.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id_number")
      .eq("id", user.id)
      .single();

    const { data: cart } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        products(
          id,
          price
        )
      `)
      .eq("user_id", user.id);

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    let total = 0;

    cart.forEach((item: any) => {
      total += item.products.price * item.quantity;
    });

    const orderNumber =
      "ORD-" +
      Date.now().toString().slice(-8);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total,
        payment_proof: receiptPath,
        member_id: profile?.id_number,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const orderItems = cart.map((item: any) => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price: item.products.price,
    }));

    await supabase
      .from("order_items")
      .insert(orderItems);

    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    alert("Order submitted successfully.");

    router.push("/orders");
  };

  return (
    <button
      onClick={submitOrder}
      className="w-full rounded-xl bg-emerald-500 py-4 font-semibold text-white hover:bg-emerald-600"
    >
      Submit Order
    </button>
  );
}
