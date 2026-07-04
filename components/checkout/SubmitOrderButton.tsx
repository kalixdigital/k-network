"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { OrderSummaryItem, getFirstProduct } from "@/types/database";

type Props = {
  receiptPath: string;
};

export default function SubmitOrderButton({ receiptPath }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submitOrder = async () => {
    if (!receiptPath) {
      showToast.error("Please upload your payment receipt");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showToast.error("Please login to continue");
        router.push("/login");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id_number")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        showToast.error("Could not find your profile");
        setLoading(false);
        return;
      }

      const { data: cart, error: cartError } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            points
          )
        `)
        .eq("user_id", user.id);

      if (cartError) {
        console.error("Cart error:", cartError);
        showToast.error("Could not load your cart");
        setLoading(false);
        return;
      }

      if (!cart || cart.length === 0) {
        showToast.error("Your cart is empty");
        setLoading(false);
        return;
      }

      // ✅ Use OrderSummaryItem type instead of CartItemWithProduct
      const cartItems = (cart ?? []) as unknown as OrderSummaryItem[];

      // Calculate totals
      let total = 0;
      let totalPoints = 0;

      cartItems.forEach((item) => {
        const product = getFirstProduct(item);
        if (product) {
          total += product.price * item.quantity;
          totalPoints += product.points * item.quantity;
        }
      });

      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total,
          total_points: totalPoints,
          payment_proof: receiptPath,
          member_id: profile?.id_number,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        showToast.error(`Failed to create order: ${orderError.message}`);
        setLoading(false);
        return;
      }

      // Create order items
      const orderItems = cartItems.map((item) => {
        const product = getFirstProduct(item);
        return {
          order_id: order.id,
          product_id: product?.id || '',
          quantity: item.quantity,
          price: product?.price || 0,
          points_earned: (product?.points || 0) * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
        showToast.error("Failed to save order items");
        setLoading(false);
        return;
      }

      // Clear cart
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      window.dispatchEvent(new Event("cartUpdated"));

      try {
        await supabase
          .from("activities")
          .insert({
            user_id: user.id,
            title: "Order Placed",
            description: `Order #${orderNumber} placed successfully`,
            type: "purchase",
          });
      } catch (activityError) {
        console.warn("Activity log error:", activityError);
      }

      showToast.success(`Order #${orderNumber} submitted successfully!`);
      
      setTimeout(() => {
        router.push("/orders");
      }, 1500);

    } catch (error: any) {
      console.error("💥 Order submission error:", error);
      showToast.error(error?.message || "Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={submitOrder}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Check className="h-5 w-5" />
          Submit Order
        </>
      )}
    </button>
  );
}