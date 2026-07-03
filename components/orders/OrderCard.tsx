"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package, Calendar, Award } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import { showToast } from "@/components/ui/toast";

type Order = {
  id: string;
  order_number: string;
  total: number;
  total_points: number;
  status: string;
  payment_status: string;
  member_id: string;
  payment_proof: string | null;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
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
  };
};

export default function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusMessage = () => {
    const status = order.status.toLowerCase();
    switch (status) {
      case "pending":
        return "⏳ Awaiting payment verification. Please allow 24-48 hours for processing.";
      case "processing":
        return "🔄 Your order is being processed. You'll receive a notification when ready.";
      case "completed":
        return `✅ Order completed! You earned ${order.total_points} points.`;
      case "cancelled":
        return "❌ Order cancelled. Please contact support if you have questions.";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    const status = order.status.toLowerCase();
    switch (status) {
      case "pending":
        return "border-yellow-500/20 bg-yellow-500/5";
      case "processing":
        return "border-blue-500/20 bg-blue-500/5";
      case "completed":
        return "border-green-500/20 bg-green-500/5";
      case "cancelled":
        return "border-red-500/20 bg-red-500/5";
      default:
        return "border-slate-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`rounded-2xl border ${getStatusColor()} bg-slate-900/50 p-6 transition hover:border-slate-700`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">
              {order.order_number}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            ₦{Number(order.total).toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-4 w-4" />
              {formatDate(order.created_at)}
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Award className="h-4 w-4" />
              +{order.total_points} points
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View Details
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      <div className="mt-4 rounded-xl bg-slate-800/50 p-3">
        <p className="text-sm text-slate-300">{getStatusMessage()}</p>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
          {/* Order Details */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Member ID</p>
              <p className="font-mono text-sm text-white">
                {order.member_id || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Payment Status</p>
              <p className="text-sm text-white capitalize">
                {order.payment_status}
              </p>
            </div>
            {order.payment_proof && (
              <div className="sm:col-span-2">
                <p className="text-xs uppercase text-slate-400">Payment Receipt</p>
                <a
                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-receipts/${order.payment_proof}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline"
                >
                  📎 View Receipt
                </a>
              </div>
            )}
          </div>

          {/* Order Items (if available) */}
          {order.order_items && order.order_items.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase text-slate-400">Items</p>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.product?.name || "Product"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity} × ₦{Number(item.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-yellow-400">
                        +{item.points_earned} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}