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
    <div className="min-h-screen pb-24 lg:pb-0">
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
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2">
            <CartList />
          </div>

          {/* Cart Summary - Right Column */}
          <div>
            {/* Summary Card */}
            <CartSummary />

            {/* Checkout Button - Desktop */}
            <div className="hidden lg:block mt-6">
              <CheckoutButton />
            </div>
          </div>
        </div>

        {/* Checkout Button - Mobile Only (sticky bottom) */}
        <div className="lg:hidden">
        {/* Checkout Button - Mobile Only (sticky bottom) */}
        <div className="lg:hidden sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 mt-6">
            <CheckoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}