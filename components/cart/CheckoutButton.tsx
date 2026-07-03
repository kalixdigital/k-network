"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

export default function CheckoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showToast.error("Please login to checkout");
        router.push("/login");
        setLoading(false);
        return;
      }

      // Check if cart has items
      const { data: cartItems, error: cartError } = await supabase
        .from("cart_items")
        .select("quantity, products(id, name, stock)")
        .eq("user_id", user.id);

      if (cartError) throw cartError;

      if (!cartItems || cartItems.length === 0) {
        showToast.warning("Your cart is empty");
        setLoading(false);
        return;
      }

      // Check stock availability
      const outOfStock = cartItems.filter(
        (item) => item.quantity > item.products.stock
      );

      if (outOfStock.length > 0) {
        showToast.error(
          `"${outOfStock[0].products.name}" has insufficient stock`
        );
        setLoading(false);
        return;
      }

      // Proceed to checkout
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
      showToast.error("Failed to proceed to checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-semibold text-white transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard size={20} />
          Proceed to Checkout
        </>
      )}
    </button>
  );
}