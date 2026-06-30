import CartList from "@/components/cart/CartList";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">

      <div className="mx-auto max-w-6xl px-6 py-10">

        <h1 className="text-4xl font-bold text-white">
          Shopping Cart
        </h1>

        <p className="mt-2 text-slate-400">
          Review your selected products before checkout.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2">
            <CartList />
          </div>

          <div>
            <CartSummary />
          </div>

        </div>

      </div>

    </div>
  );
}
