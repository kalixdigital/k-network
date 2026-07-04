import { Metadata } from "next";
import CartList from "@/components/cart/CartList";
import CartSummary from "@/components/cart/CartSummary";
import CheckoutButton from "@/components/cart/CheckoutButton";

export const metadata: Metadata = {
  title: "Shopping Cart | K-NETWORK",
  description: "Review your selected products before checkout",
};

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Shopping Cart
          </h1>
          <p className="mt-2 text-slate-400">
            Review your selected products before checkout
          </p>
        </div>

        {/* Cart Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartList />

          </div>
          <div>
            <CartSummary />
                        {/* Optional: Add checkout button below cart on mobile */}
            <div className="mt-6 lg:hidden">
              <CheckoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}