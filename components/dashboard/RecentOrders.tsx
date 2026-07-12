"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type Order = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  total_points: number;
  created_at: string;
};

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-400 bg-yellow-500/20" },
  processing: { label: "Processing", icon: Package, color: "text-blue-400 bg-blue-500/20" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/20" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-400 bg-red-500/20" },
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's membership level for theming
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_level")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserLevel(profile.membership_level || 1);
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, status, total_points, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Orders fetch error:", error);
        setLoading(false);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${config.color}`}
      >
        <Icon className="h-2.5 w-2.5" />
        {config.label}
      </span>
    );
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 h-full">
        <div className="flex items-center justify-center py-6 md:py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent md:h-8 md:w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur h-full md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className={`h-4 w-4 md:h-5 md:w-5 ${levelColor}`} />
          <h2 className="text-sm font-semibold text-white md:text-lg">Recent Orders</h2>
        </div>
        <Link
          href="/orders"
          className={`text-xs md:text-sm ${levelColor} hover:opacity-80 flex items-center gap-1`}
        >
          View All
          <Eye className="h-3 w-3 md:h-4 md:w-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-3 rounded-xl bg-slate-800/30 p-4 text-center md:p-6">
          <Package className="mx-auto h-6 w-6 text-slate-500 md:h-8 md:w-8" />
          <p className="mt-1 text-xs text-slate-400 md:text-sm">No orders yet</p>
          <Link
            href="/products"
            className={`mt-2 inline-block rounded-lg ${levelData.bgColor} px-3 py-1 text-xs font-semibold text-white hover:opacity-90 md:px-4 md:py-2`}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-2 md:mt-4 md:space-y-2.5">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl bg-slate-800/30 p-2.5 transition hover:bg-slate-800/50 md:p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <p className="text-xs font-medium text-white truncate md:text-sm">
                    {order.order_number}
                  </p>
                  {getStatusBadge(order.status)}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-400 md:gap-2 md:text-xs">
                  <span>{formatDate(order.created_at)}</span>
                  <span>•</span>
                  <span>₦{order.total.toLocaleString()}</span>
                  <span>•</span>
                  <span className="text-yellow-400">+{order.total_points} pts</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}