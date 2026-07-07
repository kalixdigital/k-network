import { Metadata } from "next";
import ProductsList from "@/components/admin/products/ProductsList";

export const metadata: Metadata = {
  title: "Products | Admin | K-NETWORK",
  description: "Manage products",
};

export default function AdminProductsPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Products Management</h1>
          <p className="mt-1 text-slate-400">Manage your product catalog</p>
        </div>
        <a
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <span>+</span>
          Add Product
        </a>
      </div>

      <div className="w-full overflow-hidden">
        <ProductsList />
      </div>
    </div>
  );
}