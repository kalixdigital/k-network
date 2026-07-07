"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Download, RefreshCw } from "lucide-react";
import LineChart from "@/components/admin/charts/LineChart";
import BarChart from "@/components/admin/charts/BarChart";
import PieChart from "@/components/admin/charts/PieChart";

type SalesStats = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
};

type DailySales = {
  date: string;
  orders: number;
  revenue: number;
};

export default function SalesReport() {
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    loadSalesData();
  }, [dateRange]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      let query = supabase.from("orders").select("*");

      if (dateRange.from) {
        query = query.gte("created_at", dateRange.from);
      }
      if (dateRange.to) {
        query = query.lte("created_at", dateRange.to);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
      const completedOrders = orders?.filter(o => o.status === "completed").length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        pendingOrders,
        completedOrders,
      });

      // Status distribution for pie chart
      const statusMap: Record<string, number> = {};
      orders?.forEach((order: any) => {
        statusMap[order.status] = (statusMap[order.status] || 0) + 1;
      });
      const statusDataArray = Object.entries(statusMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setStatusData(statusDataArray);

      // Daily sales data for line chart
      const dailyMap: Record<string, { orders: number; revenue: number }> = {};
      orders?.forEach((order: any) => {
        const date = new Date(order.created_at).toISOString().split("T")[0];
        if (!dailyMap[date]) {
          dailyMap[date] = { orders: 0, revenue: 0 };
        }
        dailyMap[date].orders += 1;
        dailyMap[date].revenue += order.total;
      });

      const dailyData = Object.entries(dailyMap)
        .map(([date, data]) => ({
          date,
          orders: data.orders,
          revenue: data.revenue,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      setDailySales(dailyData);
    } catch (error) {
      console.error("Error loading sales data:", error);
      showToast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (dailySales.length === 0) return;

    const headers = ["Date", "Orders", "Revenue"];
    const rows = dailySales.map(d => [
      d.date,
      d.orders.toString(),
      d.revenue.toString(),
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400">From</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="mt-1 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400">To</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="mt-1 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          onClick={loadSalesData}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <RefreshCw className="h-4 w-4" />
          Apply Filter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">
            ₦{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Total Orders</p>
          <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Average Order Value</p>
          <p className="text-2xl font-bold text-blue-400">
            ₦{stats.averageOrderValue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <LineChart
            data={dailySales}
            xKey="date"
            lines={[
              { key: "revenue", color: "emerald", name: "Revenue (₦)" },
            ]}
          />
        </div>

        {/* Orders Trend */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Orders Trend</h3>
          <BarChart
            data={dailySales}
            xKey="date"
            bars={[
              { key: "orders", color: "blue", name: "Orders" },
            ]}
          />
        </div>

        {/* Order Status Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status Distribution</h3>
          <PieChart data={statusData} />
        </div>
      </div>

      {/* Daily Sales Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Daily Sales</h2>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {dailySales.length === 0 ? (
          <p className="mt-4 text-center text-slate-400">No sales data available</p>
        ) : (
          <div className="mt-4 w-full overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((day) => (
                  <tr key={day.date} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {day.orders}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-400">
                      ₦{day.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}