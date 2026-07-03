"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Award, ShoppingBag, TrendingUp } from "lucide-react";
import CheckoutButton from "./CheckoutButton";

type CartSummaryType = {
  subtotal: number;
  totalPoints: number;
  itemCount: number;
};

export default function CartSummary() {
  const [summary, setSummary] = useState<CartSummaryType>({
    subtotal: 0,
    totalPoints: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const loadCartSummary = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMountedRef.current) {
          setSummary({ subtotal: 0, totalPoints: 0, itemCount: 0 });
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          quantity,
          products (
            price,
            points
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        if (isMountedRef.current) {
          setSummary({ subtotal: 0, totalPoints: 0, itemCount: 0 });
        }
        return;
      }

      const subtotal = data.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0
      );
      const totalPoints = data.reduce(
        (sum, item) => sum + item.products.points * item.quantity,
        0
      );
      const itemCount = data.reduce((sum, item) => sum + item.quantity, 0);

      if (isMountedRef.current) {
        setSummary({ subtotal, totalPoints, itemCount });
      }
    } catch (error) {
      console.error("Error loading cart summary:", error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced reload function
  const reloadSummary = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      loadCartSummary();
    }, 300);
  }, [loadCartSummary]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial load
    loadCartSummary();

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

  // Only show loading on initial load
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-3 text-lg font-semibold text-white">Loading cart...</h3>
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
    <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <h2 className="text-xl font-bold text-white">Order Summary</h2>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Subtotal</span>
          <span className="text-white">
            ₦{summary.subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Items</span>
          <span className="text-white">{summary.itemCount}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div>
            <span className="text-sm text-slate-400">Total Points</span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Award className="h-4 w-4" />
              <span className="font-bold">{summary.totalPoints}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-slate-400">Total</span>
            <p className="text-2xl font-bold text-emerald-400">
              ₦{summary.subtotal.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-3">
          <p className="flex items-center justify-center gap-2 text-center text-sm text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            Earn {summary.totalPoints} points with this purchase!
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CheckoutButton />
      </div>
    </div>
  );
}