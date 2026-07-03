"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Star, Award, Plus } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { useConfirmDialogContext } from "@/components/providers/ConfirmDialogProvider";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price: number;
  points: number;
  stock: number;
  rating?: number;
  reviews?: number;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const [loading, setLoading] = useState(false);
  const { showConfirm } = useConfirmDialogContext();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if product is in stock
    if (product.stock <= 0) {
      showToast.warning(`${product.name} is out of stock`);
      return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirm({
      title: "Add to Cart",
      message: `Add "${product.name}" to your cart?`,
      confirmText: "Yes, Add",
      cancelText: "Cancel",
      type: "info",
    });

    if (!confirmed) return;

    setLoading(true);

    try {
      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showToast.error("Please login first");
        setLoading(false);
        return;
      }

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
        const newQuantity = existingItem.quantity + 1;
        
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
            quantity: 1,
          });

        if (insertError) throw insertError;
        showToast.success(`${product.name} added to cart! 🛒`);
      }

      // Dispatch event to update cart count
      window.dispatchEvent(new Event("cartUpdated"));

    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast.error("Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all hover:border-emerald-500/50 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-emerald-500/5">
      {/* Image */}
      <div className="relative h-56 bg-slate-800 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl">🌿</span>
        )}
        
        {/* Points Badge */}
        <div className="absolute left-2 top-2 rounded-lg bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur flex items-center gap-1">
          <Award className="h-3 w-3" />
          {product.points} pts
        </div>

        {/* Stock Badge */}
        {product.stock <= 0 && (
          <div className="absolute right-2 top-2 rounded-lg bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            Out of Stock
          </div>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute right-2 top-2 rounded-lg bg-yellow-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            Low Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-white line-clamp-1">
          {product.name}
        </h2>

        {product.rating && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-white">{product.rating}</span>
            </div>
            <span className="text-sm text-slate-400">({product.reviews || 0} reviews)</span>
          </div>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {product.description}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-emerald-400">
              ₦{Number(product.price).toLocaleString()}
            </p>
            <p className="flex items-center gap-1 text-sm text-yellow-400">
              <Award className="h-3 w-3" />
              Earn {product.points} Points
            </p>
          </div>
          <div className="text-sm text-slate-400">
            Stock: {product.stock}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
          >
            <ShoppingCart size={18} />
            View Product
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock <= 0}
            className={`rounded-xl px-4 py-2.5 font-semibold transition ${
              product.stock > 0 && !loading
                ? "bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                : "cursor-not-allowed bg-slate-800 text-slate-500"
            }`}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}