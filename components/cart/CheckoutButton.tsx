"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { CartItemWithProduct, getFirstProduct, getProductStock, getProductName } from "@/types/database";

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
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            stock,
            points
          )
        `)
        .eq("user_id", user.id);

      if (cartError) {
        console.error("Cart fetch error:", cartError);
        showToast.error("Failed to load cart");
        setLoading(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        showToast.warning("Your cart is empty");
        setLoading(false);
        return;
      }

      // Type the cart items
      const typedCartItems = cartItems as CartItemWithProduct[];

      // Check stock availability using helper functions
      const outOfStock = typedCartItems.filter((item) => {
        const stock = getProductStock(item);
        return item.quantity > stock;
      });

      if (outOfStock.length > 0) {
        const productName = getProductName(outOfStock[0]);
        showToast.error(`"${productName}" has insufficient stock`);
        setLoading(false);
        return;
      }

      // Check if any product has stock = 0
      const noStock = typedCartItems.filter((item) => {
        const stock = getProductStock(item);
        return stock === 0;
      });

      if (noStock.length > 0) {
        const productName = getProductName(noStock[0]);
        showToast.error(`"${productName}" is out of stock`);
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