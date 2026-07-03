"use client";

import { Minus, Plus } from "lucide-react";
import { showToast } from "@/components/ui/toast";

type Props = {
  quantity: number;
  setQuantity: (value: number) => void;
  maxStock?: number;
};

export default function QuantitySelector({
  quantity,
  setQuantity,
  maxStock = 999,
}: Props) {
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    } else {
      showToast.warning(`Only ${maxStock} items available in stock`);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={quantity <= 1}
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
          quantity > 1
            ? "bg-slate-800 text-white hover:bg-slate-700 active:scale-95"
            : "cursor-not-allowed bg-slate-800/50 text-slate-500"
        }`}
      >
        <Minus size={18} />
      </button>

      <div className="w-16 text-center text-2xl font-bold text-white">
        {quantity}
      </div>

      <button
        type="button"
        onClick={increaseQuantity}
        disabled={quantity >= maxStock}
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
          quantity < maxStock
            ? "bg-slate-800 text-white hover:bg-slate-700 active:scale-95"
            : "cursor-not-allowed bg-slate-800/50 text-slate-500"
        }`}
      >
        <Plus size={18} />
      </button>

      <span className="text-sm text-slate-400">
        Max: {maxStock}
      </span>
    </div>
  );
}