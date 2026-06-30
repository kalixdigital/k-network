"use client";

type Props = {
  item: any;
};

export default function CartItem({ item }: Props) {
  const product = item.products;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-5">

      <div>
        <h2 className="text-lg font-bold text-white">
          {product.name}
        </h2>

        <p className="text-slate-400">
          ₦{Number(product.price).toLocaleString()}
        </p>

        <p className="text-sm text-slate-500">
          Quantity: {item.quantity}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-emerald-400">
          ₦{Number(product.price * item.quantity).toLocaleString()}
        </p>
      </div>

    </div>
  );
}
