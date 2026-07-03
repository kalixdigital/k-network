import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDetails from "@/components/products/ProductDetails";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!product) {
    return {
      title: "Product Not Found | K-NETWORK",
    };
  }

  return {
    title: `${product.name} | K-NETWORK`,
    description: product.description || `Buy ${product.name} at K-NETWORK.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Verify product exists
  const { data: product } = await supabase
    .from("products")
    .select("id, slug, is_active")
    .eq("slug", slug)
    .single();

  if (!product || !product.is_active) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductDetails slug={slug} />
      </div>
    </div>
  );
}