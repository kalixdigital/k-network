"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, Award } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { useConfirmDialogContext } from "@/components/providers/ConfirmDialogProvider";

type Product = {
  id: string;
  name: string;
  price: number;
  points: number;
  image_url: string | null;
  stock: number;
};

type CartItemWithProduct = {
  id: string;
  product_id: string;
  quantity: number;
  products: Product[];
};

type Props = {
  item: CartItemWithProduct;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string, productName: string) => void;
};

export default function CartItem({ item, onQuantityChange, onRemove }: Props) {
  const [loading, setLoading] = useState(false);
  const { showConfirm } = useConfirmDialogContext();
  
  const product = item.products?.[0];
  
  if (!product) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        Product not found
      </div>
    );
  }
  
  const productStock = product.stock ?? 0;
  const productPrice = product.price ?? 0;
  const productPoints = product.points ?? 0;
  const productName = product.name || 'Unknown Product';
  const productImage = product.image_url || null;
  
  const totalPrice = productPrice * item.quantity;
  const totalPoints = productPoints * item.quantity;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > productStock) {
      showToast.warning(`Only ${productStock} items available in stock`);
      return;
    }
    setLoading(true);
    await onQuantityChange(item.id, newQuantity);
    setLoading(false);
  };

  const handleRemove = async () => {
    const confirmed = await showConfirm({
      title: "Remove Item",
      message: `Are you sure you want to remove "${productName}" from your cart?`,
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    setLoading(true);
    await onRemove(item.id, productName);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 transition hover:border-slate-700 sm:p-4">
      {/* Top Row: Image + Product Info + Remove Button */}
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800 sm:h-20 sm:w-20">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl sm:text-3xl">
              📦
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate sm:text-base">
            {productName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">
              ₦{Number(productPrice).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Award className="h-3 w-3" />
              {productPoints} pts
            </span>
            <span className={`text-xs ${productStock > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {productStock > 0 ? `${productStock} in stock` : "Out of stock"}
            </span>
          </div>
        </div>

        {/* Remove Button - Mobile */}
        <button
          onClick={handleRemove}
          disabled={loading}
          className="flex-shrink-0 rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 sm:hidden"
          title="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Bottom Row: Quantity + Total + Remove (Desktop) */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={loading || item.quantity <= 1}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition sm:h-8 sm:w-8 ${
              item.quantity > 1 && !loading
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "cursor-not-allowed bg-slate-800/50 text-slate-500"
            }`}
          >
            <Minus size={14} />
          </button>

          <span className="w-6 text-center text-sm font-semibold text-white sm:w-8">
            {item.quantity}
          </span>

          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={loading || item.quantity >= productStock}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition sm:h-8 sm:w-8 ${
              item.quantity < productStock && !loading
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "cursor-not-allowed bg-slate-800/50 text-slate-500"
            }`}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Total Price */}
        <div className="text-right">
          <p className="text-base font-bold text-emerald-400 sm:text-lg">
            ₦{totalPrice.toLocaleString()}
          </p>
          <p className="flex items-center justify-end gap-1 text-xs text-yellow-400">
            <Award className="h-3 w-3" />
            +{totalPoints} pts
          </p>
        </div>

        {/* Remove Button - Desktop */}
        <button
          onClick={handleRemove}
          disabled={loading}
          className="hidden rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 sm:block"
          title="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}