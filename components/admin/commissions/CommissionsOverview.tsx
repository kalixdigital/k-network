"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import {
  TrendingUp,
  Users,
  Award,
  RefreshCw,
  Clock,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

type CommissionStats = {
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalMembers: number;
};

type Commission = {
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

export default function CommissionsOverview() {
  const [stats, setStats] = useState<CommissionStats>({
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    totalMembers: 0,
  });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTable, setHasTable] = useState(true);

  useEffect(() => {
    loadCommissionsData();
  }, []);

  const loadCommissionsData = async () => {
    setLoading(true);
    try {
      // First, check if commissions table exists
      const { error: tableCheckError } = await supabase
        .from("commissions")
        .select("count", { count: "exact", head: true });

      if (tableCheckError) {
        console.log("Commissions table may not exist yet:", tableCheckError.message);
        setHasTable(false);
        setLoading(false);
        return;
      }

      // Try to get commission stats
      const { data: statsData, error: statsError } = await supabase
        .from("commissions")
        .select("amount, status");

      if (statsError) {
        console.error("Stats error:", statsError);
        // If no data, just set empty stats
        setStats({
          totalCommissions: 0,
          pendingCommissions: 0,
          paidCommissions: 0,
          totalMembers: 0,
        });
        setCommissions([]);
        setLoading(false);
        return;
      }

      // Calculate stats even if statsData is empty
      const total = statsData?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      const pending = statsData?.filter(c => c.status === "pending").reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      const paid = statsData?.filter(c => c.status === "paid").reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

      // Get total members
      const { count: totalMembers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalCommissions: total,
        pendingCommissions: pending,
        paidCommissions: paid,
        totalMembers: totalMembers || 0,
      });

      // Get recent commissions with user details - using a simpler approach
      const { data: recentData, error: recentError } = await supabase
        .from("commissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (recentError) {
        console.error("Recent commissions error:", recentError);
        setCommissions([]);
        setLoading(false);
        return;
      }

      // If no data, set empty array
      if (!recentData || recentData.length === 0) {
        setCommissions([]);
        setLoading(false);
        return;
      }

      // Get user details for each commission
      const userIds = recentData.map(c => c.user_id).filter(Boolean);
      const userMap: Record<string, { full_name: string; email: string }> = {};

      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (!usersError && users) {
          users.forEach(user => {
            userMap[user.id] = {
              full_name: user.full_name || "N/A",
              email: user.email || "N/A"
            };
          });
        }
      }

      // Transform data with user details
      const transformedData = recentData.map((c: any) => ({
        ...c,
        user_full_name: userMap[c.user_id]?.full_name || "Unknown User",
        user_email: userMap[c.user_id]?.email || "N/A",
      }));

      setCommissions(transformedData);
      setHasTable(true);
    } catch (error: any) {
      console.error("Error loading commissions:", error);
      if (error?.message?.includes('does not exist') || error?.code === '42P01') {
        setHasTable(false);
      } else {
        showToast.error("Failed to load commissions data");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "member",
      header: "Member",
      width: "180px",
      render: (item: Commission) => (
        <div>
          <p className="font-medium text-white truncate max-w-[120px]">
            {item.user_full_name || "N/A"}
          </p>
          <p className="text-xs text-slate-400 truncate max-w-[120px]">
            {item.user_email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "120px",
      render: (item: Commission) => (
        <span className="font-bold text-emerald-400">
          ₦{(item.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "120px",
      render: (item: Commission) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          item.type === 'direct' ? 'bg-emerald-500/20 text-emerald-400' :
          item.type === 'indirect' ? 'bg-purple-500/20 text-purple-400' :
          item.type === 'bonus' ? 'bg-amber-500/20 text-amber-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {item.type || "General"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (item: Commission) => (
        <StatusBadge status={item.status || "pending"} type="payment" />
      ),
    },
    {
      key: "description",
      header: "Description",
      width: "200px",
      render: (item: Commission) => (
        <span className="text-slate-300 truncate block max-w-[180px]">
          {item.description || "N/A"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      width: "120px",
      render: (item: Commission) => (
        <span className="text-slate-400 whitespace-nowrap">
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading commissions data...</p>
        </div>
      </div>
    );
  }

  if (!hasTable) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white">Commissions System</h3>
        <p className="mt-2 text-slate-400">
          The commissions system is being set up. Commissions will appear here once the points engine is activated.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          This feature requires the Points Calculator Engine to be implemented.
        </p>
        <button
          onClick={loadCommissionsData}
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
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Commissions"
          value={`₦${stats.totalCommissions.toLocaleString()}`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard
          title="Pending Payouts"
          value={`₦${stats.pendingCommissions.toLocaleString()}`}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Paid Commissions"
          value={`₦${stats.paidCommissions.toLocaleString()}`}
          icon={Award}
          color="blue"
        />
        <StatsCard
          title="Active Members"
          value={stats.totalMembers}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Recent Commissions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Recent Commissions</h2>
          <button
            onClick={loadCommissionsData}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-4 w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <DataTable
              data={commissions}
              columns={columns}
              loading={loading}
              emptyMessage="No commissions recorded yet. Commissions will appear once the points engine is activated."
            />
          </div>
        </div>
      </div>
    </div>
  );
}