"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
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

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setProducts(data || []);
    };

    loadProducts();
  }, []);

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
