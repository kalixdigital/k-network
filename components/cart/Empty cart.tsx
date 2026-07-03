"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-slate-800 p-6">
        <ShoppingCart className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">Your cart is empty</h2>
      <p className="mt-2 text-slate-400">
        Looks like you haven't added any items yet
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
      >
        Start Shopping
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}