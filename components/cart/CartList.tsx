"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import CartItem from "./CartItem";
import { ShoppingCart, RefreshCw } from "lucide-react";

type CartItemType = {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number;
    points: number;
  };
};

export default function CartList() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadCart = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User fetch error:", userError);
        showToast.error("Please login to view your cart");
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }

      if (!user) {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
          setItems([]);
          setUserId(null);
        }
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock,
            points
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Cart fetch error:", error);
        showToast.error("Failed to load cart");
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }

      if (isMountedRef.current) {
        setItems(data || []);
        // Only dispatch event if items changed
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      showToast.error("Failed to load cart");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      loadCart(true);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [loadCart]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", itemId);

      if (error) throw error;

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      // Only dispatch once after update
      window.dispatchEvent(new Event("cartUpdated"));
      showToast.success("Quantity updated");
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      
      // Only dispatch once after removal
      window.dispatchEvent(new Event("cartUpdated"));
      showToast.success(`${productName} removed from cart`);
    } catch (error) {
      console.error("Error removing item:", error);
      showToast.error("Failed to remove item");
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    loadCart(true);
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/50 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
            <p className="mt-4 text-slate-400">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <div className="text-6xl">🔒</div>
        <h3 className="mt-4 text-xl font-semibold text-white">Please Login</h3>
        <p className="mt-2 text-slate-400">Login to view your cart items</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <div className="text-6xl">🛒</div>
        <h3 className="mt-4 text-xl font-semibold text-white">Your cart is empty</h3>
        <p className="mt-2 text-slate-400">Start shopping to add items to your cart</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Header with Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {items.length} item{items.length > 1 ? "s" : ""} in your cart
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Cart Items */}
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemoveItem}
        />
      ))}
    </div>
  );
}