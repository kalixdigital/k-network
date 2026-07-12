"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Loader2, CheckCircle } from "lucide-react";
import { createNotification, NotificationTemplates } from "@/lib/services/notificationService";

type SubmitOrderButtonProps = {
  receiptPath: string;
};

export default function SubmitOrderButton({ receiptPath }: SubmitOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!receiptPath) {
      showToast.error("Please upload your payment receipt first");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        showToast.error("Please login to continue");
        setLoading(false);
        return;
      }

      // Get user profile for notification
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const customerName = userProfile?.full_name || user.user_metadata?.full_name || "Customer";
      console.log("👤 Customer:", customerName, "ID:", user.id);

      // Get cart items with product data
      const { data: cartItems, error: cartError } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            points
          )
        `)
        .eq("user_id", user.id);

      if (cartError) {
        console.error("Cart fetch error:", cartError);
        showToast.error("Failed to load cart");
        setLoading(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        showToast.error("Your cart is empty");
        setLoading(false);
        return;
      }

      // Normalize data
      const normalizedItems = cartItems.map((item: any) => {
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

      // Calculate totals
      let total = 0;
      let totalPoints = 0;
      const orderItems = normalizedItems.map((item: any) => {
        const product = item.products?.[0];
        if (!product) return null;
        const price = product.price || 0;
        const points = product.points || 0;
        total += price * item.quantity;
        totalPoints += points * item.quantity;
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: price,
          points_earned: points,
        };
      }).filter(Boolean);

      if (orderItems.length === 0) {
        showToast.error("No valid products in cart");
        setLoading(false);
        return;
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total: total,
          total_points: totalPoints,
          payment_proof: receiptPath,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        showToast.error("Failed to create order");
        setLoading(false);
        return;
      }

      // Create order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(
          orderItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            points_earned: item.points_earned,
          }))
        );

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        showToast.error("Failed to create order items");
        setLoading(false);
        return;
      }

      // Clear cart
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      // ============================================
      // CREATE NOTIFICATION FOR THE USER
      // ============================================
      const userNotification = NotificationTemplates.orderPlaced(orderNumber, total, totalPoints);
      await createNotification({
        userId: user.id,
        title: userNotification.title,
        description: userNotification.description,
        type: userNotification.type,
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          total: total,
          total_points: totalPoints,
        },
      });
      console.log("✅ User notification created");

      // ============================================
      // GET ADMIN USERS USING RPC FUNCTION (Bypasses RLS)
      // ============================================
      console.log("🔍 Fetching admin users via RPC...");
      
      const { data: admins, error: adminsError } = await supabase
        .rpc('get_admin_users');

      if (adminsError) {
        console.error("❌ Error fetching admins via RPC:", adminsError);
      }

      console.log(`👥 Found ${admins?.length || 0} admin(s)`);

      if (admins && admins.length > 0) {
        admins.forEach((admin: any, index: number) => {
          console.log(`  Admin ${index + 1}: ${admin.full_name || admin.email} (${admin.id})`);
        });
      }

      if (admins && admins.length > 0) {
        let adminNotifCount = 0;
        
        for (const admin of admins) {
          try {
            // Skip if admin is the same as the customer
            if (admin.id === user.id) {
              console.log(`⏭️ Skipping admin ${admin.full_name || admin.email} - same as customer`);
              continue;
            }
            
            console.log(`📨 Creating notification for admin: ${admin.full_name || admin.email}`);
            
            const adminNotif = NotificationTemplates.newOrderAdmin(orderNumber, customerName, total);
            
            // Use RPC function to bypass RLS for admin notifications
            const { data: adminNotifResult, error: adminNotifError } = await supabase
              .rpc('create_admin_notification', {
                p_user_id: admin.id,
                p_title: adminNotif.title,
                p_description: adminNotif.description,
                p_type: adminNotif.type,
                p_metadata: {
                  order_id: order.id,
                  order_number: orderNumber,
                  total: total,
                  customer_id: user.id,
                  customer_name: customerName,
                }
              });

            if (adminNotifError) {
              console.error(`❌ Failed to create notification for admin ${admin.full_name || admin.email}:`, adminNotifError);
            } else {
              adminNotifCount++;
              console.log(`✅ Admin notification created for ${admin.full_name || admin.email}`);
            }
          } catch (adminError) {
            console.error(`❌ Error creating notification for admin:`, adminError);
          }
        }
        
        console.log(`📨 Created ${adminNotifCount} admin notification(s)`);
      } else {
        console.warn("⚠️ No admin users found in the database.");
      }

      showToast.success(`Order #${orderNumber} placed successfully!`);
      
      setTimeout(() => {
        router.push("/orders");
      }, 2000);

    } catch (error: any) {
      console.error("Order submission error:", error);
      showToast.error(error.message || "Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={loading || !receiptPath}
      className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CheckCircle className="h-5 w-5" />
          Submit Order
        </>
      )}
    </button>
  );
}