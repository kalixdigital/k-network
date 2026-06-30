"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/checkout")}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 font-semibold text-white hover:bg-emerald-600"
    >
      <CreditCard size={20} />
      Proceed to Checkout
    </button>
  );
}
