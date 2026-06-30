"use client";

import CheckoutButton from "./CheckoutButton";

export default function CartSummary() {
  return (
    <div className="rounded-2xl bg-slate-900 p-6">

      <h2 className="text-xl font-bold text-white">
        Order Summary
      </h2>

      <p className="mt-4 text-slate-400">
        Your total will be calculated during checkout.
      </p>

      <div className="mt-6">
        <CheckoutButton />
      </div>

    </div>
  );
}
