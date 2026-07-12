"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Award, ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  points: number;
  image_url: string | null;
  stock: number;
};

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  products: Product[];
};

type CartSummaryType = {
  subtotal: number;
  totalPoints: number;
  itemCount: number;
};

export default function CartSummary() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummaryType>({
    subtotal: 0,
    totalPoints: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const loadCartSummary = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsUpdating(true);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMountedRef.current) {
          setItems([]);
          setSummary({ subtotal: 0, totalPoints: 0, itemCount: 0 });
          setLoading(false);
          setIsUpdating(false);
        }
        return;
      }

      // Get cart items with product data using nested select
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
        if (isMountedRef.current) {
          setLoading(false);
          setIsUpdating(false);
        }
        return;
      }

      if (!cartData || cartData.length === 0) {
        if (isMountedRef.current) {
          setItems([]);
          setSummary({ subtotal: 0, totalPoints: 0, itemCount: 0 });
          setLoading(false);
          setIsUpdating(false);
        }
        return;
      }

      // Normalize data - ensure products is always an array
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

      let subtotal = 0;
      let totalPoints = 0;
      let itemCount = 0;

      normalizedItems.forEach((item: CartItem) => {
        if (item.products && item.products.length > 0) {
          const product = item.products[0];
          subtotal += product.price * item.quantity;
          totalPoints += product.points * item.quantity;
          itemCount += item.quantity;
        }
      });

      if (isMountedRef.current) {
        setItems(normalizedItems);
        setSummary({ subtotal, totalPoints, itemCount });
      }
    } catch (error) {
      console.error("Error loading cart summary:", error);
      showToast.error("Failed to load cart summary");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsUpdating(false);
      }
    }
  }, []);

  // Debounced reload function
  const reloadSummary = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      loadCartSummary(true);
    }, 300);
  }, [loadCartSummary]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial load
    loadCartSummary(true);

    // Listen for cart updates
    const handleCartUpdate = () => {
      reloadSummary();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("cartUpdated", handleCartUpdate);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [loadCartSummary, reloadSummary]);

  // Show loading only on initial load
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (summary.itemCount === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-3 text-lg font-semibold text-white">Cart is empty</h3>
          <p className="text-sm text-slate-400">Add items to see summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Order Summary</h2>
        {isUpdating && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        )}
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => {
          if (!item.products || item.products.length === 0) return null;
          const product = item.products[0];
          
          return (
            <div key={index} className="flex justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                <p className="text-xs text-yellow-400">
                  +{product.points * item.quantity} pts
                </p>
              </div>
              <p className="font-bold text-emerald-400">
                ₦{(product.price * item.quantity).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-700 pt-6">
        <div className="flex justify-between">
          <span className="text-slate-400">Subtotal</span>
          <span className="text-white">₦{summary.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Points Earned</span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Award className="h-4 w-4" />
            +{summary.totalPoints}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-700 pt-3">
          <span className="text-lg font-bold text-white">Total</span>
          <span className="text-2xl font-bold text-emerald-400">
            ₦{summary.subtotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}