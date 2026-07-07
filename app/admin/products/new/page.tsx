import { Metadata } from "next";
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata: Metadata = {
  title: "Add Product | Admin | K-NETWORK",
  description: "Create a new product",
};

export default function NewProductPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Add New Product</h1>
        <p className="mt-1 text-slate-400">Create a new product for your catalog</p>
      </div>

      <ProductForm />
    </div>
  );
}