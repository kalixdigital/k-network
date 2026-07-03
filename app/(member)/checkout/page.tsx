"use client";

import { useState, useEffect } from "react";
import BankDetails from "@/components/checkout/BankDetails";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentInstructions from "@/components/checkout/PaymentInstructions";
import UploadReceipt from "@/components/checkout/UploadReceipt";
import SubmitOrderButton from "@/components/checkout/SubmitOrderButton";
import { supabase } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const [receiptPath, setReceiptPath] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const loadTotal = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("cart_items")
          .select(`
            quantity,
            products(price)
          `)
          .eq("user_id", user.id);

        if (data) {
          const total = data.reduce(
            (sum, item) => sum + item.products.price * item.quantity,
            0
          );
          setTotalAmount(total);
        }
      } catch (error) {
        console.error("Error loading total:", error);
      }
    };

    loadTotal();
  }, []);

  const handleReceiptUpload = (path: string) => {
    console.log("📤 Receipt uploaded, path:", path);
    setReceiptPath(path);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-slate-400">
            Complete your order by following the instructions below
          </p>
        </div>

        {/* Order Summary - Full Width at Top */}
        <div className="max-w-3xl mx-auto">
          <OrderSummary />
        </div>

        {/* Checkout Form - Full Width */}
        <div className="max-w-3xl mx-auto space-y-6">
          <BankDetails />
          <PaymentInstructions totalAmount={totalAmount} />
          <UploadReceipt onUploaded={handleReceiptUpload} />
          <SubmitOrderButton receiptPath={receiptPath} />
        </div>
      </div>
    </div>
  );
}