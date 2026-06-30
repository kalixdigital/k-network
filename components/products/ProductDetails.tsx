"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import QuantitySelector from "./QuantitySelector";
import AddToCartButton from "./AddToCartButton";

type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  points: number;
  stock: number;
};

export default function ProductDetails({
  slug,
}: {
  slug: string;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      setProduct(data);
    };

    loadProduct();
  }, [slug]);

  if (!product) {
    return (
      <div className="p-10 text-center text-white">
        Loading product...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">

      <div className="grid gap-10 md:grid-cols-2">

        <div className="rounded-3xl bg-slate-900 p-6 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="rounded-2xl"
            />
          ) : (
            <span className="text-8xl">🌿</span>
          )}
        </div>

        <div>

          <h1 className="text-4xl font-bold text-white">
            {product.name}
          </h1>

          <p className="mt-4 text-slate-400">
            {product.description}
          </p>

          <p className="mt-6 text-4xl font-bold text-emerald-400">
            ₦{Number(product.price).toLocaleString()}
          </p>

          <p className="mt-2 text-white">
            Earn <strong>{product.points}</strong> Points
          </p>

          <p className="mt-2 text-slate-400">
            Stock: {product.stock}
          </p>

          <div className="mt-8">
            <QuantitySelector
              quantity={quantity}
              setQuantity={setQuantity}
            />
          </div>

          <div className="mt-8">
            <AddToCartButton
              product={product}
              quantity={quantity}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
