"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

type Product = {
  id: string;
  name: string;
  price: number;
  points: number;
  stock: number;
};

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  products: Product[];
};

export default function CheckoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Helper to get product from cart item
  const getProduct = (item: CartItem): Product | null => {
    if (!item.products) return null;
    if (Array.isArray(item.products) && item.products.length > 0) {
      return item.products[0];
    }
    return null;
  };

  const getProductName = (item: CartItem): string => {
    const product = getProduct(item);
    return product?.name || 'Unknown Product';
  };

  const getProductStock = (item: CartItem): number => {
    const product = getProduct(item);
    return product?.stock ?? 0;
  };

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

      // Check if cart has items with product data
      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
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

      if (!cartData || cartData.length === 0) {
        showToast.warning("Your cart is empty");
        setLoading(false);
        return;
      }

      // Normalize cart items (ensure products is an array)
      const normalizedItems = cartData.map((item: any) => {
        let products = [];
        if (item.products && Array.isArray(item.products)) {
          products = item.products;
        } else if (item.products && typeof item.products === 'object') {
          products = [item.products];
        }
        return {
          ...item,
          products: products,
        };
      });

      // Filter out items without products
      const validItems = normalizedItems.filter(
        (item: CartItem) => item.products && item.products.length > 0
      );

      if (validItems.length === 0) {
        showToast.error("Some items in your cart are no longer available");
        setLoading(false);
        return;
      }

      // Check stock availability
      const outOfStock = validItems.filter((item: CartItem) => {
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
      const noStock = validItems.filter((item: CartItem) => {
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