"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import BarChart from "@/components/admin/charts/BarChart";
import PieChart from "@/components/admin/charts/PieChart";

type MemberStats = {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  newMembersThisMonth: number;
};

type MemberGrowth = {
  month: string;
  count: number;
};

export default function MemberReport() {
  const [stats, setStats] = useState<MemberStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    newMembersThisMonth: 0,
  });
  const [growth, setGrowth] = useState<MemberGrowth[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("is_verified, created_at");

      if (error) throw error;

      const totalMembers = profiles?.length || 0;
      const activeMembers = profiles?.filter(p => p.is_verified).length || 0;
      const pendingMembers = totalMembers - activeMembers;

      // New members this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newMembersThisMonth = profiles?.filter(
        p => new Date(p.created_at) >= startOfMonth
      ).length || 0;

      setStats({
        totalMembers,
        activeMembers,
        pendingMembers,
        newMembersThisMonth,
      });

      // ✅ Member status distribution for pie chart
      setStatusData([
        { name: "Active", value: activeMembers },
        { name: "Pending", value: pendingMembers },
      ]);

      // Member growth by month (last 6 months)
      const monthMap: Record<string, number> = {};
      profiles?.forEach((p: any) => {
        const date = new Date(p.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      });

      const sortedKeys = Object.keys(monthMap).sort();
      const growthData = sortedKeys.slice(-6).map(key => ({
        month: key,
        count: monthMap[key],
      }));

      setGrowth(growthData);
    } catch (error) {
      console.error("Error loading member data:", error);
      showToast.error("Failed to load member data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading member data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Total Members</p>
          <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Active Members</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.activeMembers}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pendingMembers}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">New This Month</p>
          <p className="text-2xl font-bold text-blue-400">{stats.newMembersThisMonth}</p>
        </div>
      </div>

      {/* 📊 Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Member Status Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Member Status</h3>
          <PieChart data={statusData} colors={["#10b981", "#eab308"]} />
        </div>

        {/* Member Growth */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Member Growth (Last 6 Months)</h3>
          <BarChart
            data={growth}
            xKey="month"
            bars={[
              { key: "count", color: "emerald", name: "New Members" },
            ]}
          />
        </div>
      </div>

      {/* Member Growth Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-bold text-white">Member Growth (Last 6 Months)</h2>

        {growth.length === 0 ? (
          <p className="mt-4 text-center text-slate-400">No growth data available</p>
        ) : (
          <div className="mt-4 w-full overflow-x-auto">
            <table className="w-full min-w-[300px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Month
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    New Members
                  </th>
                </tr>
              </thead>
              <tbody>
                {growth.map((item) => (
                  <tr key={item.month} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(item.month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {item.count}
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