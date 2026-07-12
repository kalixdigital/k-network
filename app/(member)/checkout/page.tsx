"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BankDetails from "@/components/checkout/BankDetails";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentInstructions from "@/components/checkout/PaymentInstructions";
import UploadReceipt from "@/components/checkout/UploadReceipt";
import SubmitOrderButton from "@/components/checkout/SubmitOrderButton";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  points: number;
  image_url: string | null;
  stock: number;
};

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  products: Product[];
};

export default function CheckoutPage() {
  const router = useRouter();
  const [receiptPath, setReceiptPath] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadCart();
  }, []);

  const checkAuthAndLoadCart = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // Redirect to login but don't lose the checkout page
        router.push("/login?redirect=/checkout");
        return;
      }

      setIsAuthenticated(true);
      await loadCartData(user.id);
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartData = async (userId: string) => {
    try {
      const { data: cartData, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            points,
            image_url,
            stock
          )
        `)
        .eq("user_id", userId);

      if (error) {
        console.error("Error loading cart:", error);
        return;
      }

      if (!cartData || cartData.length === 0) {
        setCartItems([]);
        setTotalAmount(0);
        return;
      }

      // Normalize data - ensure products is an array
      const normalizedItems = cartData.map((item: any) => {
        let products = [];
        if (item.products && Array.isArray(item.products)) {
          products = item.products;
        } else if (item.products && typeof item.products === 'object') {
          products = [item.products];
        }
        return {
          ...item,
          products: products,
        };
      });

      setCartItems(normalizedItems);

      // Calculate total
      let total = 0;
      normalizedItems.forEach((item: CartItem) => {
        if (item.products && item.products.length > 0) {
          const product = item.products[0];
          total += product.price * item.quantity;
        }
      });
      setTotalAmount(total);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const handleReceiptUpload = (path: string) => {
    console.log("📤 Receipt uploaded, path:", path);
    setReceiptPath(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
          <p className="mt-4 text-slate-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
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