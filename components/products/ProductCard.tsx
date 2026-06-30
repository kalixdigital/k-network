"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

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

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">

      <div className="h-56 bg-slate-800 flex items-center justify-center">

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl">🌿</span>
        )}

      </div>

      <div className="p-6">

        <h2 className="text-xl font-bold text-white">
          {product.name}
        </h2>

        <p className="mt-2 line-clamp-2 text-slate-400">
          {product.description}
        </p>

        <div className="mt-5 flex justify-between">

          <div>
            <p className="text-2xl font-bold text-emerald-400">
              ₦{Number(product.price).toLocaleString()}
            </p>

            <p className="text-sm text-slate-400">
              {product.points} Points
            </p>
          </div>

          <div className="text-sm text-slate-400">
            Stock: {product.stock}
          </div>

        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600"
        >
          <ShoppingCart size={18} />
          View Product
        </Link>

      </div>

    </div>
  );
}
