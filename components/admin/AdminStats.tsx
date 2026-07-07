"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Users, ShoppingBag, Package, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";

type Stats = {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
};

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get total orders
        const { count: totalOrders } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Get total products
        const { count: totalProducts } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // Get total revenue (completed orders)
        const { data: completedOrders } = await supabase
          .from("orders")
          .select("total")
          .eq("status", "completed");

        const totalRevenue = completedOrders?.reduce(
          (sum, order) => sum + order.total,
          0
        ) || 0;

        setStats({
          totalUsers: totalUsers || 0,
          totalOrders: totalOrders || 0,
          totalProducts: totalProducts || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "emerald" as const,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "blue" as const,
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "purple" as const,
    },
    {
      title: "Total Revenue",
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "amber" as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="h-4 w-24 rounded bg-slate-800" />
            <div className="mt-4 h-8 w-16 rounded bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}