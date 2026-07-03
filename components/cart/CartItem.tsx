"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, Award } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { useConfirmDialogContext } from "@/components/providers/ConfirmDialogProvider";

type Props = {
  item: {
    id: string;
    quantity: number;
    products: {
      id: string;
      name: string;
      price: number;
      image_url: string | null;
      stock: number;
      points: number;
    };
  };
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string, productName: string) => void;
};

export default function CartItem({ item, onQuantityChange, onRemove }: Props) {
  const [loading, setLoading] = useState(false);
  const { showConfirm } = useConfirmDialogContext();
  const product = item.products;
  const totalPrice = product.price * item.quantity;
  const totalPoints = product.points * item.quantity;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      showToast.warning(`Only ${product.stock} items available in stock`);
      return;
    }
    setLoading(true);
    await onQuantityChange(item.id, newQuantity);
    setLoading(false);
  };

  const handleRemove = async () => {
    // Use custom confirm dialog
    const confirmed = await showConfirm({
      title: "Remove Item",
      message: `Are you sure you want to remove "${product.name}" from your cart?`,
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    setLoading(true);
    await onRemove(item.id, product.name);
    setLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700">
      {/* Product Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">
            🌿
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white truncate">
          {product.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-slate-400">
            ₦{Number(product.price).toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Award className="h-3 w-3" />
            {product.points} pts each
          </span>
          <span className={`text-xs ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
            item.quantity > 1 && !loading
              ? "bg-slate-800 text-white hover:bg-slate-700"
              : "cursor-not-allowed bg-slate-800/50 text-slate-500"
          }`}
        >
          <Minus size={14} />
        </button>

        <span className="w-8 text-center font-semibold text-white">
          {item.quantity}
        </span>

        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={loading || item.quantity >= product.stock}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
            item.quantity < product.stock && !loading
              ? "bg-slate-800 text-white hover:bg-slate-700"
              : "cursor-not-allowed bg-slate-800/50 text-slate-500"
          }`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Total and Remove */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-400">
            ₦{totalPrice.toLocaleString()}
          </p>
          <p className="flex items-center justify-end gap-1 text-xs text-yellow-400">
            <Award className="h-3 w-3" />
            +{totalPoints} pts
          </p>
        </div>

        <button
          onClick={handleRemove}
          disabled={loading}
          className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
          title="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}