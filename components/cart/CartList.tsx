"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import CartItem from "./CartItem";
import { RefreshCw, ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  points: number;
  image_url: string | null;
  stock: number;
};

type CartItemWithProduct = {
  id: string;
  product_id: string;
  quantity: number;
  products: Product[];
};

export default function CartList() {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
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

      if (userError || !user) {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
          setItems([]);
          setUserId(null);
        }
        return;
      }

      setUserId(user.id);

      // Get cart items with product data using the correct relationship
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
            points,
            image_url,
            stock
          )
        `)
        .eq("user_id", user.id);

      if (cartError) {
        console.error("Cart fetch error:", cartError);
        showToast.error("Failed to load cart");
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }

      if (!cartData || cartData.length === 0) {
        if (isMountedRef.current) {
          setItems([]);
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }

      // Ensure each item has a products array
      const formattedItems = cartData.map((item: any) => {
        // If products is already an array, use it
        if (item.products && Array.isArray(item.products)) {
          return {
            ...item,
            products: item.products,
          };
        }
        // If products is a single object, wrap it in an array
        if (item.products && typeof item.products === 'object') {
          return {
            ...item,
            products: [item.products],
          };
        }
        // If no products, set empty array
        return {
          ...item,
          products: [],
        };
      });

      console.log("✅ Formatted cart items:", formattedItems);

      if (isMountedRef.current) {
        setItems(formattedItems);
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

    const handleCartUpdate = () => {
      if (isMountedRef.current) {
        loadCart(true);
      }
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

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

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
      
      window.dispatchEvent(new Event("cartUpdated"));
      showToast.success(`${productName} removed from cart`);
    } catch (error) {
      console.error("Error removing item:", error);
      showToast.error("Failed to remove item");
    }
  };

  const handleRefresh = () => {
    loadCart(true);
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/50 p-6 sm:p-8">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent sm:h-12 sm:w-12" />
            <p className="mt-3 text-sm text-slate-400 sm:mt-4">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center sm:p-8">
        <div className="text-5xl sm:text-6xl">🔒</div>
        <h3 className="mt-3 text-lg font-semibold text-white sm:text-xl">Please Login</h3>
        <p className="mt-1 text-sm text-slate-400">Login to view your cart items</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center sm:p-8">
        <ShoppingBag className="mx-auto h-12 w-12 text-slate-600 sm:h-16 sm:w-16" />
        <h3 className="mt-3 text-lg font-semibold text-white sm:text-xl">Your cart is empty</h3>
        <p className="mt-1 text-sm text-slate-400">Start shopping to add items to your cart</p>
      </div>
    );
  }

  // Filter out items without products
  const validItems = items.filter(item => 
    item.products && Array.isArray(item.products) && item.products.length > 0
  );

  if (validItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center sm:p-8">
        <div className="text-5xl sm:text-6xl">⚠️</div>
        <h3 className="mt-3 text-lg font-semibold text-white sm:text-xl">Some items unavailable</h3>
        <p className="mt-1 text-sm text-slate-400">Some products in your cart are no longer available</p>
        <button
          onClick={handleRefresh}
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
        >
          Refresh Cart
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          {validItems.length} item{validItems.length > 1 ? "s" : ""} in your cart
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {validItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>
    </div>
  );
}