"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
};

type Props = {
  product: Product;
  quantity: number;
};

export default function AddToCartButton({
  product,
  quantity,
}: Props) {
  const router = useRouter();

  const addToCart = async () => {
    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      router.push("/login");
      return;
    }

    // Check if product already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
        })
        .eq("id", existingItem.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      // Insert new cart item
      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    alert("Product added to cart.");

    router.push("/cart");
  };

  return (
    <button
      onClick={addToCart}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white hover:bg-emerald-600"
    >
      <ShoppingCart size={20} />
      Add to Cart
    </button>
  );
}
