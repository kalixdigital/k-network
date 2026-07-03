"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import ProductCard from "./ProductCard";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price: number;
  points: number;
  stock: number;
};

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      showToast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden"
          >
            <div className="h-56 bg-slate-800" />
            <div className="p-6 space-y-4">
              <div className="h-6 w-3/4 rounded bg-slate-800" />
              <div className="h-4 w-full rounded bg-slate-800" />
              <div className="h-4 w-2/3 rounded bg-slate-800" />
              <div className="flex justify-between">
                <div className="h-8 w-24 rounded bg-slate-800" />
                <div className="h-8 w-16 rounded bg-slate-800" />
              </div>
              <div className="h-12 w-full rounded bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-20 text-center">
        <div className="text-6xl">🛍️</div>
        <h3 className="mt-4 text-xl font-semibold text-white">No products available</h3>
        <p className="mt-2 text-slate-400">Check back later for new products</p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}