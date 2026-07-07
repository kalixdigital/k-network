"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Download, RefreshCw } from "lucide-react";
import LineChart from "@/components/admin/charts/LineChart";
import PieChart from "@/components/admin/charts/PieChart";

type CommissionStats = {
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  averageCommission: number;
};

type CommissionEntry = {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
  user_full_name?: string;
  user_email?: string;
};

export default function CommissionReport() {
  const [stats, setStats] = useState<CommissionStats>({
    totalCommissions: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
    averageCommission: 0,
  });
  const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
  const [commissionTrend, setCommissionTrend] = useState<{ date: string; amount: number }[]>([]);
  const [typeData, setTypeData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [hasTable, setHasTable] = useState(true);

  useEffect(() => {
    loadCommissionData();
  }, [dateRange]);

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      const { error: tableCheckError } = await supabase
        .from("commissions")
        .select("count", { count: "exact", head: true });

      if (tableCheckError) {
        console.log("Commissions table check:", tableCheckError.message);
        setHasTable(false);
        setLoading(false);
        return;
      }

      let query = supabase
        .from("commissions")
        .select("*");

      if (dateRange.from) {
        query = query.gte("created_at", dateRange.from);
      }
      if (dateRange.to) {
        query = query.lte("created_at", dateRange.to);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Query error:", error);
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          setHasTable(false);
          setLoading(false);
          return;
        }
        throw error;
      }

      if (!data || data.length === 0) {
        setCommissions([]);
        setCommissionTrend([]);
        setTypeData([]);
        setStats({
          totalCommissions: 0,
          paidCommissions: 0,
          pendingCommissions: 0,
          averageCommission: 0,
        });
        setHasTable(true);
        setLoading(false);
        return;
      }

      const userIds = data.map(c => c.user_id).filter(Boolean);
      let userMap: Record<string, { full_name: string; email: string }> = {};

      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (!usersError && users) {
          userMap = users.reduce((acc, user) => ({
            ...acc,
            [user.id]: {
              full_name: user.full_name || "N/A",
              email: user.email || "N/A"
            }
          }), {});
        }
      }

      const transformedData = data.map((c: any) => ({
        ...c,
        user_full_name: userMap[c.user_id]?.full_name || "N/A",
        user_email: userMap[c.user_id]?.email || "N/A",
      }));

      setCommissions(transformedData);

      // Calculate stats
      const total = transformedData.reduce((sum, c) => sum + (c.amount || 0), 0);
      const paid = transformedData
        .filter(c => c.status === "paid")
        .reduce((sum, c) => sum + (c.amount || 0), 0);
      const pending = transformedData
        .filter(c => c.status === "pending")
        .reduce((sum, c) => sum + (c.amount || 0), 0);
      const avg = transformedData.length > 0 ? total / transformedData.length : 0;

      setStats({
        totalCommissions: total,
        paidCommissions: paid,
        pendingCommissions: pending,
        averageCommission: avg,
      });

      // ✅ Commission trend by date
      const trendMap: Record<string, number> = {};
      transformedData.forEach((c: any) => {
        const date = new Date(c.created_at).toISOString().split("T")[0];
        trendMap[date] = (trendMap[date] || 0) + c.amount;
      });

      const trendArray = Object.entries(trendMap)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);
      setCommissionTrend(trendArray);

      // ✅ Type distribution for pie chart
      const typeMap: Record<string, number> = {};
      transformedData.forEach((c: any) => {
        typeMap[c.type] = (typeMap[c.type] || 0) + c.amount;
      });
      const typeDataArray = Object.entries(typeMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setTypeData(typeDataArray);

      setHasTable(true);
    } catch (error: any) {
      console.error("Error loading commission data:", error);
      if (error?.message?.includes('does not exist') || error?.code === '42P01') {
        setHasTable(false);
      } else {
        showToast.error(error?.message || "Failed to load commission data");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (commissions.length === 0) return;

    const headers = ["Member", "Email", "Amount", "Type", "Status", "Date"];
    const rows = commissions.map(c => [
      c.user_full_name || "N/A",
      c.user_email || "N/A",
      (c.amount || 0).toString(),
      c.type || "N/A",
      c.status || "N/A",
      c.created_at ? new Date(c.created_at).toLocaleDateString() : "N/A",
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commission-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading commission data...</p>
        </div>
      </div>
    );
  }

  if (!hasTable) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white">Commission Reports</h3>
        <p className="mt-2 text-slate-400">
          The commissions system is being set up. Commission reports will appear here once the points engine is activated.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          This feature requires the Points Calculator Engine to be implemented.
        </p>
        <button
          onClick={loadCommissionData}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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
          onClick={loadCommissionData}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <RefreshCw className="h-4 w-4" />
          Apply Filter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Total Commissions</p>
          <p className="text-2xl font-bold text-emerald-400">
            ₦{stats.totalCommissions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Paid</p>
          <p className="text-2xl font-bold text-green-400">
            ₦{stats.paidCommissions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            ₦{stats.pendingCommissions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Average Commission</p>
          <p className="text-2xl font-bold text-blue-400">
            ₦{stats.averageCommission.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 📊 Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Commission Trend */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Commission Trend</h3>
          <LineChart
            data={commissionTrend}
            xKey="date"
            lines={[
              { key: "amount", color: "emerald", name: "Commission (₦)" },
            ]}
          />
        </div>

        {/* Commission by Type */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Commission by Type</h3>
          <PieChart data={typeData} />
        </div>
      </div>

      {/* Commission Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Commission History</h2>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {commissions.length === 0 ? (
          <p className="mt-4 text-center text-slate-400">
            No commissions recorded yet. Commissions will appear once the points engine is activated.
          </p>
        ) : (
          <div className="mt-4 w-full overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Member
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-sm text-white">
                      {commission.user_full_name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-400">
                      ₦{(commission.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        commission.type === 'direct' ? 'bg-emerald-500/20 text-emerald-400' :
                        commission.type === 'indirect' ? 'bg-purple-500/20 text-purple-400' :
                        commission.type === 'bonus' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {commission.type || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        commission.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        commission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {commission.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-400">
                      {commission.created_at ? new Date(commission.created_at).toLocaleDateString() : "N/A"}
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