"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Award, Copy, Check } from "lucide-react";
import { OrderSummaryItem, getFirstProduct } from "@/types/database";

export default function OrderSummary() {
  const [items, setItems] = useState<OrderSummaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          showToast.error("Please login to view your cart");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("cart_items")
          .select(`
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

        if (error) throw error;

        if (!data || data.length === 0) {
          setItems([]);
          setTotal(0);
          setTotalPoints(0);
          setLoading(false);
          return;
        }

        // ✅ Cast safely using 'as unknown as'
        const cartItems = (data ?? []) as unknown as OrderSummaryItem[];
        setItems(cartItems);

        let sum = 0;
        let points = 0;

        cartItems.forEach((item) => {
          const product = getFirstProduct(item);
          if (product) {
            sum += product.price * item.quantity;
            points += product.points * item.quantity;
          }
        });

        setTotal(sum);
        setTotalPoints(points);
      } catch (error) {
        console.error("Error loading cart:", error);
        showToast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(`₦${total.toLocaleString()}`);
      setCopied(true);
      showToast.success("Amount copied!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showToast.error("Failed to copy amount");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center">
        <p className="text-slate-400">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <h2 className="text-2xl font-bold text-white">Order Summary</h2>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => {
          const product = getFirstProduct(item);
          if (!product) return null;
          
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
          <span className="text-white">₦{total.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Points Earned</span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Award className="h-4 w-4" />
            +{totalPoints}
          </span>
        </div>
      </div>

      {/* ⭐ Exact Amount to Transfer - Prominent Display */}
      <div className="mt-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="text-sm text-slate-400 text-center">Amount to Transfer</p>
        <div className="flex items-center justify-center gap-3 mt-1">
          <p className="text-3xl font-bold text-emerald-400">
            ₦{total.toLocaleString()}
          </p>
          <button
            onClick={copyAmount}
            className="rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/10"
            title="Copy amount"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-1">
          Transfer this exact amount to the account below
        </p>
      </div>
    </div>
  );
}