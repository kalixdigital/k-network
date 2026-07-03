"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import QuantitySelector from "./QuantitySelector";
import AddToCartButton from "./AddToCartButton";

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

export default function ProductDetails({
  slug,
}: {
  slug: string;
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      if (!data) {
        showToast.error("Product not found");
        router.push("/products");
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);
      showToast.error("Failed to load product");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartSuccess = () => {
    // Optionally reset quantity after adding to cart
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="animate-pulse rounded-3xl bg-slate-900 p-6 flex items-center justify-center min-h-[300px]">
            <div className="h-56 w-56 rounded-2xl bg-slate-800" />
          </div>
          <div className="space-y-6">
            <div className="h-10 w-3/4 rounded bg-slate-800" />
            <div className="h-20 w-full rounded bg-slate-800" />
            <div className="h-12 w-1/2 rounded bg-slate-800" />
            <div className="h-6 w-1/3 rounded bg-slate-800" />
            <div className="h-12 w-full rounded bg-slate-800" />
            <div className="h-14 w-full rounded bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="text-6xl">🔍</div>
          <h2 className="mt-4 text-2xl font-bold text-white">Product not found</h2>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative rounded-3xl bg-slate-900 p-6 flex items-center justify-center min-h-[300px]">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="rounded-2xl max-h-[400px] w-full object-contain"
            />
          ) : (
            <span className="text-8xl">🌿</span>
          )}
          
          {product.stock <= 0 && (
            <div className="absolute right-4 top-4 rounded-lg bg-red-600/90 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              Out of Stock
            </div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute right-4 top-4 rounded-lg bg-yellow-600/90 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              Low Stock
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl font-bold text-white">
            {product.name}
          </h1>

          <p className="mt-4 text-slate-400">
            {product.description}
          </p>

          <div className="mt-6">
            <p className="text-4xl font-bold text-emerald-400">
              ₦{Number(product.price).toLocaleString()}
            </p>
            <p className="mt-2 text-white">
              Earn <strong className="text-emerald-400">{product.points}</strong> Points
            </p>
            <p className={`mt-1 text-sm ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </p>
          </div>

          {product.stock > 0 && (
            <>
              <div className="mt-8">
                <QuantitySelector
                  quantity={quantity}
                  setQuantity={setQuantity}
                  maxStock={product.stock}
                />
              </div>

              <div className="mt-8">
                <AddToCartButton
                  product={product}
                  quantity={quantity}
                  onSuccess={handleAddToCartSuccess}
                />
              </div>
            </>
          )}

          {product.stock <= 0 && (
            <button
              disabled
              className="mt-8 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-4 text-lg font-semibold text-slate-400"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}