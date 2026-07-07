import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/products/ProductForm";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", id)
    .single();

  if (!product) {
    return {
      title: "Product Not Found | Admin | K-NETWORK",
    };
  }

  return {
    title: `Edit ${product.name} | Admin | K-NETWORK`,
    description: `Edit ${product.name}`,
  };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Product</h1>
        <p className="mt-1 text-slate-400">Update product details</p>
      </div>

      <ProductForm product={product} isEditing />
    </div>
  );
}