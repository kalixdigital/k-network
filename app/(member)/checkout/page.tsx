"use client";

import { useState } from "react";

import OrderSummary from "@/components/checkout/OrderSummary";
import BankDetails from "@/components/checkout/BankDetails";
import PaymentInstructions from "@/components/checkout/PaymentInstructions";
import UploadReceipt from "@/components/checkout/UploadReceipt";
import SubmitOrderButton from "@/components/checkout/SubmitOrderButton";

export default function CheckoutPage() {
  const [receiptPath, setReceiptPath] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">

      <div className="mx-auto max-w-5xl px-6 py-10">

        <h1 className="text-4xl font-bold text-white">
          Checkout
        </h1>

        <div className="mt-10 space-y-8">

          <OrderSummary />

          <BankDetails />

          <PaymentInstructions />

          <UploadReceipt
            onUploaded={setReceiptPath}
          />

          <SubmitOrderButton
            receiptPath={receiptPath}
          />

        </div>

      </div>

    </div>
  );
}
