"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { activateNewUser } from "@/lib/services/activateNewUser";
import { processReturningUser } from "@/lib/services/processReturningUser";
import { createNotification, NotificationTemplates, getAdminUsers } from "@/lib/services/notificationService";

type Order = {
  id: string;
  order_number: string;
  user_id: string;
  member_id: string;
  total: number;
  total_points: number;
  status: string;
  payment_status: string;
  payment_proof: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  points_earned: number;
  product?: {
    name: string;
    image_url: string | null;
    points: number;
  };
};

type Props = {
  id: string;
};

export default function OrderDetails({ id }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      if (!orderData) {
        showToast.error("Order not found");
        router.push("/admin/orders");
        return;
      }

      setOrder(orderData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products (
            name,
            image_url,
            points
          )
        `)
        .eq("order_id", id);

      if (itemsError) throw itemsError;

      setItems(itemsData || []);
    } catch (error) {
      console.error("Error loading order details:", error);
      showToast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SEND NOTIFICATIONS HELPERS
  // ============================================
  
  const sendUserNotification = async (userId: string, title: string, description: string, type: string, metadata: any) => {
    try {
      await createNotification({
        userId,
        title,
        description,
        type: type as any,
        metadata,
      });
      console.log(`✅ User notification sent: ${title}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send user notification:", error);
      return false;
    }
  };

  const sendAdminNotifications = async (title: string, description: string, metadata: any) => {
    try {
      const admins = await getAdminUsers();
      
      if (!admins || admins.length === 0) {
        console.log("⚠️ No admins found to notify");
        return;
      }

      let successCount = 0;
      for (const admin of admins) {
        try {
          await createNotification({
            userId: admin.id,
            title,
            description,
            type: "system",
            metadata,
          });
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to notify admin ${admin.email}:`, error);
        }
      }
      
      console.log(`✅ Notified ${successCount} admin(s)`);
    } catch (error) {
      console.error("❌ Failed to send admin notifications:", error);
    }
  };

  const updateOrderStatus = async (status: string, paymentStatus?: string) => {
    setUpdating(true);
    try {
      const updates: any = { status };
      if (paymentStatus) {
        updates.payment_status = paymentStatus;
      }

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Get user details for notifications
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", order?.user_id)
        .single();

      const customerName = userProfile?.full_name || "Customer";

      // ============================================
      // SEND NOTIFICATIONS BASED ON STATUS CHANGE
      // ============================================

      // 1. ORDER APPROVED (Pending → Processing)
      if (status === "processing" && paymentStatus === "paid") {
        // User notification
        await sendUserNotification(
          order!.user_id,
          "Order Approved! ✅",
          `Your order #${order!.order_number} has been approved and is being processed. We'll notify you once it's completed.`,
          "purchase",
          {
            order_id: order!.id,
            order_number: order!.order_number,
            status: "processing",
          }
        );

        // Admin notification (status update)
        await sendAdminNotifications(
          "Order Status Updated 📦",
          `Order #${order!.order_number} has been approved and is now being processed.`,
          {
            order_id: order!.id,
            order_number: order!.order_number,
            status: "processing",
            customer: customerName,
          }
        );

        showToast.success(`Order ${order!.order_number} approved successfully`);
      }

      // 2. ORDER COMPLETED (Processing → Completed)
      else if (status === "completed") {
        // User notification
        await sendUserNotification(
          order!.user_id,
          "Order Completed! 🎉",
          `Your order #${order!.order_number} has been completed. Thank you for your purchase! You earned ${order!.total_points} points.`,
          "purchase",
          {
            order_id: order!.id,
            order_number: order!.order_number,
            status: "completed",
            total_points: order!.total_points,
          }
        );

        // Admin notification
        await sendAdminNotifications(
          "Order Completed 🎉",
          `Order #${order!.order_number} has been completed. Total: ₦${order!.total.toLocaleString()}`,
          {
            order_id: order!.id,
            order_number: order!.order_number,
            status: "completed",
            customer: customerName,
            total: order!.total,
          }
        );

        // ✅ Process order completion (points engine)
        try {
          const { data: previousOrders } = await supabase
            .from("orders")
            .select("id")
            .eq("user_id", order?.user_id)
            .eq("status", "completed")
            .neq("id", id)
            .limit(1);

          const isFirstPurchase = !previousOrders || previousOrders.length === 0;

          let result;
          let isActivation = false;

          if (isFirstPurchase) {
            console.log("🎉 First purchase detected! Activating user...");
            result = await activateNewUser(order!.user_id, id);
            isActivation = true;
          } else {
            console.log("📦 Subsequent purchase - awarding points...");
            result = await processReturningUser(order!.user_id, id);
            isActivation = false;
          }

          if (result.success) {
            let message = "";
            
            if (isActivation) {
              message = `🎉 User activated! ${result.productPoints} product points awarded.`;
              
              // Send activation notification
              await sendUserNotification(
                order!.user_id,
                "Account Activated! 🎉",
                `Your account has been activated! You earned ${result.productPoints} product points from your first purchase.`,
                "activation",
                {
                  order_id: order!.id,
                  order_number: order!.order_number,
                  points: result.productPoints,
                }
              );
            } else {
              message = `✅ Order completed! ${result.productPoints} product points awarded.`;
              
              // Send points notification for returning user
              await sendUserNotification(
                order!.user_id,
                "Points Earned! ⭐",
                `You earned ${result.productPoints} points from order #${order!.order_number}.`,
                "points",
                {
                  order_id: order!.id,
                  order_number: order!.order_number,
                  points: result.productPoints,
                }
              );
            }
            
            if (result.directReferralPoints && result.directReferralPoints > 0) {
              message += ` Direct referrer earned ${result.directReferralPoints} points.`;
              
              // Find and notify referrer
              const { data: userProfile } = await supabase
                .from("profiles")
                .select("referred_by")
                .eq("id", order!.user_id)
                .single();

              if (userProfile?.referred_by) {
                const { data: referrer } = await supabase
                  .from("profiles")
                  .select("id, full_name")
                  .eq("id", userProfile.referred_by)
                  .single();

                if (referrer) {
                  await sendUserNotification(
                    referrer.id,
                    "Referral Bonus Earned! 🎉",
                    `You earned ${result.directReferralPoints} points from ${customerName}'s purchase!`,
                    "referral",
                    {
                      order_id: order!.id,
                      order_number: order!.order_number,
                      points: result.directReferralPoints,
                      referred_user: customerName,
                    }
                  );
                }
              }
            }
            
            if (result.indirectReferralPoints && result.indirectReferralPoints > 0) {
              message += ` Indirect referrer earned ${result.indirectReferralPoints} points.`;
            }
            
            showToast.success(message);
          } else {
            showToast.warning(`Order completed but processing failed: ${result.error}`);
          }
        } catch (engineError) {
          console.error("Points engine error:", engineError);
          showToast.warning("Order completed but points may not have been awarded");
        }
      }

      // 3. ORDER REJECTED (Pending/Processing → Cancelled)
      else if (status === "cancelled") {
        // User notification
        await sendUserNotification(
          order!.user_id,
          "Order Cancelled ❌",
          `Your order #${order!.order_number} has been cancelled. Please contact support if you have any questions.`,
          "purchase",
          {
            order_id: order!.id,
            order_number: order!.order_number,
            status: "cancelled",
          }
        );

        // Admin notification
        await sendAdminNotifications(
          "Order Cancelled ❌",
          `Order #${order!.order_number} has been cancelled.`,
          {
            order_id: order!.id,
            order_number: order!.order_number,
            status: "cancelled",
            customer: customerName,
          }
        );

        showToast.success(`Order ${order!.order_number} cancelled`);
      }

      loadOrderDetails();
    } catch (error) {
      console.error("Error updating order:", error);
      showToast.error("Failed to update order");
    } finally {
      setUpdating(false);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setShowCompleteDialog(false);
    }
  };

  const handleViewReceipt = () => {
    if (order?.payment_proof) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-receipts/${order.payment_proof}`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Order not found</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
      </div>
    );
  }

  const canApprove = order.status === "pending" && order.payment_status === "pending";
  const canComplete = order.status === "processing";
  const canReject = order.status === "pending" || order.status === "processing";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/orders")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{order.order_number}</h1>
          <p className="text-sm text-slate-400">
            {new Date(order.created_at).toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={order.status} type="order" />
            <StatusBadge status={order.payment_status} type="payment" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canApprove && (
            <button
              onClick={() => setShowApproveDialog(true)}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          )}

          {canComplete && (
            <button
              onClick={() => setShowCompleteDialog(true)}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Complete
            </button>
          )}

          {canReject && (
            <button
              onClick={() => setShowRejectDialog(true)}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          )}

          <button
            onClick={loadOrderDetails}
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Order Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Order Items</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-yellow-400">
                        +{item.points_earned} pts
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-emerald-400">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Order Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">₦{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Points Earned</span>
                <span className="text-yellow-400">+{order.total_points}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3">
                <span className="font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-emerald-400">
                  ₦{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Customer</h2>
            <div className="mt-4 space-y-2">
              <p className="text-slate-300">Member ID: {order.member_id}</p>
            </div>
          </div>

          {order.payment_proof && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white">Payment Proof</h2>
              <button
                onClick={handleViewReceipt}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                <Eye className="h-4 w-4" />
                View Receipt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={() => updateOrderStatus("processing", "paid")}
        title="Approve Order"
        message={`Are you sure you want to approve order ${order.order_number}? This will mark the payment as verified.`}
        confirmText="Approve"
        cancelText="Cancel"
        type="info"
      />

      <ConfirmDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={() => updateOrderStatus("completed")}
        title="Complete Order"
        message={`Are you sure you want to mark order ${order.order_number} as completed?`}
        confirmText="Complete"
        cancelText="Cancel"
        type="success"
      />

      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={() => updateOrderStatus("cancelled", "failed")}
        title="Reject Order"
        message={`Are you sure you want to reject order ${order.order_number}?`}
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}