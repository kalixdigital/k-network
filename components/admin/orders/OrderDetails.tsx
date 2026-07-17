"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import PromotionEligibleUsers from "@/components/admin/PromotionEligibleUsers";
import { activateNewUser } from "@/lib/services/activateNewUser";
import { processReturningUser } from "@/lib/services/processReturningUser";
import { createNotification, getAdminUsers } from "@/lib/services/notificationService";

// ============================================
// TYPES
// ============================================

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

type NotificationType = 'purchase' | 'referral' | 'points' | 'withdrawal' | 'system' | 'membership' | 'activation';

type Props = {
  id: string;
};

type UserProfile = {
  full_name: string;
  email: string;
  referred_by: string | null;
};

// ============================================
// COMPONENT
// ============================================

export default function OrderDetails({ id }: Props) {
  const router = useRouter();

  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  const loadOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch order
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

      // Fetch user profile
      await loadUserProfile(orderData.user_id);

      // Fetch order items
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
  }, [id, router]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, referred_by, is_verified, is_active")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUserProfile(data);
      setUserVerified(data?.is_verified === true);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserVerified(false);
    }
  };

  // ============================================
  // NOTIFICATIONS
  // ============================================

  const sendUserNotification = useCallback(
    async (userId: string, title: string, description: string, type: NotificationType, metadata: any) => {
      try {
        await createNotification({ userId, title, description, type, metadata });
        return true;
      } catch (error) {
        console.error("Failed to send user notification:", error);
        return false;
      }
    },
    []
  );

  const sendAdminNotifications = useCallback(
    async (title: string, description: string, metadata: any) => {
      try {
        const admins = await getAdminUsers();
        if (!admins?.length) return;

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
            console.error(`Failed to notify admin ${admin.email}:`, error);
          }
        }
      } catch (error) {
        console.error("Failed to send admin notifications:", error);
      }
    },
    []
  );

  // ============================================
  // ORDER STATUS UPDATES
  // ============================================

  const handleOrderApproved = useCallback(
    async (orderData: Order, customerName: string) => {
      await sendUserNotification(
        orderData.user_id,
        "Order Approved! ✅",
        `Your order #${orderData.order_number} has been approved and is being processed.`,
        "purchase",
        {
          order_id: orderData.id,
          order_number: orderData.order_number,
          status: "processing",
        }
      );

      await sendAdminNotifications(
        "Order Status Updated 📦",
        `Order #${orderData.order_number} has been approved and is now being processed.`,
        {
          order_id: orderData.id,
          order_number: orderData.order_number,
          status: "processing",
          customer: customerName,
        }
      );

      showToast.success(`Order ${orderData.order_number} approved successfully`);
    },
    [sendUserNotification, sendAdminNotifications]
  );

  const handleOrderCompleted = useCallback(
    async (orderData: Order, customerName: string) => {
      // Notify user
      await sendUserNotification(
        orderData.user_id,
        "Order Completed! 🎉",
        `Your order #${orderData.order_number} has been completed. You earned ${orderData.total_points} points.`,
        "purchase",
        {
          order_id: orderData.id,
          order_number: orderData.order_number,
          status: "completed",
          total_points: orderData.total_points,
        }
      );

      await sendAdminNotifications(
        "Order Completed 🎉",
        `Order #${orderData.order_number} has been completed. Total: ₦${orderData.total.toLocaleString()}`,
        {
          order_id: orderData.id,
          order_number: orderData.order_number,
          status: "completed",
          customer: customerName,
          total: orderData.total,
        }
      );

      // Process points engine
      await processOrderCompletion(orderData);
    },
    [sendUserNotification, sendAdminNotifications]
  );

  const processOrderCompletion = useCallback(
    async (orderData: Order) => {
      try {
        // Check if this is the user's first purchase
        const { data: previousOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", orderData.user_id)
          .eq("status", "completed")
          .neq("id", id)
          .limit(1);
  
        const isFirstPurchase = !previousOrders?.length;
  
        let result;
        let isActivation = false;
  
        if (isFirstPurchase) {
          console.log("🎉 First purchase detected! Activating user...");
          result = await activateNewUser(orderData.user_id, id);
          isActivation = true;
        } else {
          console.log("📦 Subsequent purchase - awarding points...");
          // ✅ Fix: Only pass 2 arguments
          result = await processReturningUser(orderData.user_id, id);
          isActivation = false;
        }
  
        const isSuccess = result?.success === true;
  
        if (isSuccess) {
          await handlePointsAwarded(result, orderData, isActivation);
        } else {
          showToast.warning(`Order completed but processing failed: ${result?.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Points engine error:", error);
        showToast.warning("Order completed but points may not have been awarded");
      }
    },
    [id]
  );

  const handlePointsAwarded = useCallback(
    async (result: any, orderData: Order, isActivation: boolean) => {
      const customerName = userProfile?.full_name || "Customer";
      let message = "";

      if (isActivation) {
        message = `🎉 User activated! ${result.productPoints || 0} product points awarded.`;

        await sendUserNotification(
          orderData.user_id,
          "Account Activated! 🎉",
          `Your account has been activated! You earned ${result.productPoints || 0} product points.`,
          "activation",
          {
            order_id: orderData.id,
            order_number: orderData.order_number,
            points: result.productPoints || 0,
          }
        );
      } else {
        message = `✅ Order completed! ${result.productPoints || 0} product points awarded.`;

        await sendUserNotification(
          orderData.user_id,
          "Points Earned! ⭐",
          `You earned ${result.productPoints || 0} points from order #${orderData.order_number}.`,
          "points",
          {
            order_id: orderData.id,
            order_number: orderData.order_number,
            points: result.productPoints || 0,
          }
        );
      }

      // Handle referral bonuses
      const directBonus = result.directReferralPoints || result.direct_referral_bonus || 0;
      if (directBonus > 0 && userProfile?.referred_by) {
        await handleReferralBonus(userProfile.referred_by, directBonus, customerName, orderData);
        message += ` Direct referrer earned ${directBonus} points.`;
      }

      const indirectBonus = result.indirectReferralPoints || result.indirect_referral_bonus || 0;
      if (indirectBonus > 0) {
        message += ` Indirect referrer earned ${indirectBonus} points.`;
      }

      showToast.success(message);
    },
    [userProfile, sendUserNotification]
  );

  const handleReferralBonus = useCallback(
    async (referrerId: string, points: number, customerName: string, orderData: Order) => {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", referrerId)
        .single();

      if (referrer) {
        await sendUserNotification(
          referrer.id,
          "Referral Bonus Earned! 🎉",
          `You earned ${points} points from ${customerName}'s purchase!`,
          "referral",
          {
            order_id: orderData.id,
            order_number: orderData.order_number,
            points,
            referred_user: customerName,
          }
        );
      }
    },
    [sendUserNotification]
  );

  const handleOrderCancelled = useCallback(
    async (orderData: Order, customerName: string) => {
      await sendUserNotification(
        orderData.user_id,
        "Order Cancelled ❌",
        `Your order #${orderData.order_number} has been cancelled.`,
        "purchase",
        {
          order_id: orderData.id,
          order_number: orderData.order_number,
          status: "cancelled",
        }
      );

      await sendAdminNotifications(
        "Order Cancelled ❌",
        `Order #${orderData.order_number} has been cancelled.`,
        {
          order_id: orderData.id,
          order_number: orderData.order_number,
          status: "cancelled",
          customer: customerName,
        }
      );

      showToast.success(`Order ${orderData.order_number} cancelled`);
    },
    [sendUserNotification, sendAdminNotifications]
  );

  const updateOrderStatus = useCallback(
    async (status: string, paymentStatus?: string) => {
      if (!order) return;

      setUpdating(true);
      try {
        const updates: any = { status };
        if (paymentStatus) updates.payment_status = paymentStatus;

        const { error } = await supabase
          .from("orders")
          .update(updates)
          .eq("id", id);

        if (error) throw error;

        const customerName = userProfile?.full_name || "Customer";

        // Handle status-specific logic
        if (status === "processing" && paymentStatus === "paid") {
          await handleOrderApproved(order, customerName);
        } else if (status === "completed") {
          await handleOrderCompleted(order, customerName);
        } else if (status === "cancelled") {
          await handleOrderCancelled(order, customerName);
        }

        await loadOrderDetails();
      } catch (error) {
        console.error("Error updating order:", error);
        showToast.error("Failed to update order");
      } finally {
        setUpdating(false);
        setShowApproveDialog(false);
        setShowRejectDialog(false);
        setShowCompleteDialog(false);
      }
    },
    [order, id, userProfile, handleOrderApproved, handleOrderCompleted, handleOrderCancelled, loadOrderDetails]
  );

  // ============================================
  // HANDLERS
  // ============================================

  const handleApproveOrder = useCallback(() => {
    if (!userVerified) {
      showToast.error("Cannot approve order: User is not verified.");
      return;
    }
    setShowApproveDialog(true);
  }, [userVerified]);

  const handleViewReceipt = useCallback(() => {
    if (order?.payment_proof) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-receipts/${order.payment_proof}`;
      window.open(url, "_blank");
    }
  }, [order]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // ============================================
  // RENDER
  // ============================================

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
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} type="order" />
            <StatusBadge status={order.payment_status} type="payment" />

            {/* User Verification Status */}
            {userVerified !== null && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  userVerified
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {userVerified ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    User Verified
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    User Not Verified
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canApprove && (
            <button
              onClick={handleApproveOrder}
              disabled={updating || !userVerified}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition disabled:opacity-50 ${
                !userVerified
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              title={!userVerified ? "User must be verified before approving order" : ""}
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

      {/* Warning Message if User Not Verified */}
      {!userVerified && canApprove && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-400">User Not Verified</p>
              <p className="text-sm text-yellow-300/70">
                This user has not been verified yet. Please verify the user before approving this order.
                You can verify the user from the Member Details page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ Promotion Eligible Users Section */}
      {order && (
        <PromotionEligibleUsers
          userId={order.user_id}
          orderId={order.id}
          onPromotionComplete={loadOrderDetails}
        />
      )}

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
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Status:</span>
                {userVerified !== null && (
                  <span
                    className={`text-sm font-medium ${
                      userVerified ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {userVerified ? "✅ Verified" : "❌ Not Verified"}
                  </span>
                )}
              </div>
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