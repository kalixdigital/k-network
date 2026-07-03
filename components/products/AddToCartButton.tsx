"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  points?: number;
};

type Props = {
  product: Product;
  quantity: number;
  onSuccess?: () => void; // Optional callback after successful add
};

export default function AddToCartButton({
  product,
  quantity,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast.error("Please login first");
      router.push("/login");
      return;
    }

    if (quantity > product.stock) {
      showToast.warning(`Only ${product.stock} items available in stock`);
      return;
    }

    setLoading(true);

    try {
      // Check if product already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > product.stock) {
          showToast.warning(`Only ${product.stock} items available in stock`);
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
        showToast.success(`Updated ${product.name} quantity in cart`);
      } else {
        // Insert new cart item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
          });

        if (insertError) throw insertError;
        showToast.success(`${product.name} added to cart! 🛒`);
      }

      // ✅ Dispatch event to update cart count and summary everywhere
      window.dispatchEvent(new Event("cartUpdated"));

      // Call optional success callback
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to cart after a brief delay
      setTimeout(() => {
        router.push("/cart");
      }, 500);

    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast.error("Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={addToCart}
      disabled={loading || product.stock <= 0}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-semibold text-white transition active:scale-95 ${
        loading || product.stock <= 0
          ? "cursor-not-allowed bg-slate-700 text-slate-400"
          : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          Add to Cart
        </>
      )}
    </button>
  );
}