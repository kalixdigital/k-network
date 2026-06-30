"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  quantity: number;
  setQuantity: (value: number) => void;
};

export default function QuantitySelector({
  quantity,
  setQuantity,
}: Props) {
  return (
    <div className="flex items-center gap-4">

      <button
        type="button"
        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white hover:bg-slate-700"
      >
        <Minus size={18} />
      </button>

      <div className="w-16 text-center text-2xl font-bold text-white">
        {quantity}
      </div>

      <button
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white hover:bg-slate-700"
      >
        <Plus size={18} />
      </button>

    </div>
  );
}
