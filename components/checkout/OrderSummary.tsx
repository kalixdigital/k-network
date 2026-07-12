"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

type Product = {
  name: string;
  price: number;
  points: number;
  image_url?: string;
};

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  products: Product[];
};

export default function OrderSummary() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
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
            name,
            price,
            points,
            image_url
          )
        `)
        .eq("user_id", user.id);

      if (cartError) {
        console.error("Cart fetch error:", cartError);
        setLoading(false);
        return;
      }

      if (!cartData || cartData.length === 0) {
        setCartItems([]);
        setTotal(0);
        setTotalPoints(0);
        setLoading(false);
        return;
      }

      // Normalize data - ensure products is an array
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

      setCartItems(validItems);

      // Calculate totals
      let totalAmount = 0;
      let totalPointsAmount = 0;
      validItems.forEach((item: CartItem) => {
        const product = item.products[0];
        if (product) {
          totalAmount += product.price * item.quantity;
          totalPointsAmount += product.points * item.quantity;
        }
      });
      setTotal(totalAmount);
      setTotalPoints(totalPointsAmount);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingBag className="h-12 w-12 text-slate-600" />
          <p className="mt-4 text-slate-400">Your cart is empty</p>
          <Link
            href="/products"
            className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Order Summary</h2>
        </div>
        <span className="text-sm text-slate-400">{cartItems.length} items</span>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {cartItems.map((item) => {
          const product = item.products?.[0];
          if (!product) return null;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg bg-slate-800/30 p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>₦{product.price.toLocaleString()}</span>
                  <span>•</span>
                  <span>Qty: {item.quantity}</span>
                  <span>•</span>
                  <span className="text-yellow-400">+{product.points * item.quantity} pts</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  ₦{(product.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Subtotal</span>
          <span className="text-white">₦{total.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Points Earned</span>
          <span className="text-yellow-400">+{totalPoints.toLocaleString()} pts</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold border-t border-slate-800 pt-2">
          <span className="text-white">Total</span>
          <span className="text-emerald-400">₦{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}