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

        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            quantity,
            products!inner (
              price
            )
          `)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error loading cart:", error);
          return;
        }

        if (data && data.length > 0) {
          const total = data.reduce((sum: number, item: any) => {
            // Use optional chaining with array access
            const product = item.products?.[0];
            const price = product?.price || 0;
            return sum + price * item.quantity;
          }, 0);
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
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-slate-400">
            Complete your order by following the instructions below
          </p>
        </div>

        <div className="lg:hidden">
          <OrderSummary />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="hidden lg:block">
              <OrderSummary />
            </div>

            <BankDetails />
            <PaymentInstructions totalAmount={totalAmount} />
            <UploadReceipt onUploaded={handleReceiptUpload} />
            <div className="lg:hidden">
              <SubmitOrderButton receiptPath={receiptPath} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <SubmitOrderButton receiptPath={receiptPath} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}