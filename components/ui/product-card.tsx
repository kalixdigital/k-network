import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  description: string;
}

export default function ProductCard({
  image,
  name,
  price,
  description,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10">
      <div className="relative h-72 bg-slate-950">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-4 p-6">
        <h3 className="text-2xl font-bold text-white">
          {name}
        </h3>

        <p className="text-slate-400">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-emerald-400">
            {price}
          </span>

          <Button>
            View Product
          </Button>
        </div>
      </div>
    </div>
  );
}
