import ProductDetails from "@/components/products/ProductDetails";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <ProductDetails slug={slug} />
    </div>
  );
}
