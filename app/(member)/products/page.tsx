import ProductGrid from "@/components/products/ProductGrid";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">

      <div className="mx-auto max-w-7xl px-6 py-10">

        <h1 className="text-4xl font-bold text-white">
          Products
        </h1>

        <p className="mt-2 text-slate-400">
          Browse our premium wellness products.
        </p>

        <ProductGrid />

      </div>

    </div>
  );
}
