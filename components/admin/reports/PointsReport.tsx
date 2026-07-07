"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import BarChart from "@/components/admin/charts/BarChart";
import PieChart from "@/components/admin/charts/PieChart";

type PointsStats = {
  totalPoints: number;
  monthlyPoints: number;
  averagePoints: number;
  totalMembers: number;
};

type MemberPoints = {
  user_id: string;
  full_name: string;
  email: string;
  monthly_points: number;
  lifetime_points: number;
  membership_level: number;
};

export default function PointsReport() {
  const [stats, setStats] = useState<PointsStats>({
    totalPoints: 0,
    monthlyPoints: 0,
    averagePoints: 0,
    totalMembers: 0,
  });
  const [members, setMembers] = useState<MemberPoints[]>([]);
  const [levelData, setLevelData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          monthly_points,
          lifetime_points,
          membership_level
        `)
        .order("lifetime_points", { ascending: false });

      if (error) throw error;

      const transformedData = profiles?.map((p: any) => ({
        user_id: p.id,
        full_name: p.full_name || "N/A",
        email: p.email || "N/A",
        monthly_points: p.monthly_points || 0,
        lifetime_points: p.lifetime_points || 0,
        membership_level: p.membership_level || 1,
      })) || [];

      setMembers(transformedData);

      const totalPoints = transformedData.reduce((sum, m) => sum + m.lifetime_points, 0);
      const monthlyPoints = transformedData.reduce((sum, m) => sum + m.monthly_points, 0);
      const avg = transformedData.length > 0 ? totalPoints / transformedData.length : 0;

      setStats({
        totalPoints,
        monthlyPoints,
        averagePoints: avg,
        totalMembers: transformedData.length,
      });

      // ✅ Level distribution for chart
      const levelMap: Record<string, number> = {};
      profiles?.forEach((p: any) => {
        const level = `Level ${p.membership_level || 1}`;
        levelMap[level] = (levelMap[level] || 0) + 1;
      });
      const levelDataArray = Object.entries(levelMap).map(([name, value]) => ({
        name,
        value,
      }));
      setLevelData(levelDataArray);
    } catch (error) {
      console.error("Error loading points data:", error);
      showToast.error("Failed to load points data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading points data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Total Lifetime Points</p>
          <p className="text-2xl font-bold text-yellow-400">
            {stats.totalPoints.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Monthly Points</p>
          <p className="text-2xl font-bold text-emerald-400">
            {stats.monthlyPoints.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Average Points per Member</p>
          <p className="text-2xl font-bold text-blue-400">
            {stats.averagePoints.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-400">Total Members</p>
          <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
        </div>
      </div>

      {/* 📊 Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members by Level */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Members by Level</h3>
          <BarChart
            data={levelData}
            xKey="name"
            bars={[
              { key: "value", color: "purple", name: "Members" },
            ]}
          />
        </div>

        {/* Top Members by Lifetime Points */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Members by Lifetime Points</h3>
          <div className="space-y-3">
            {members.slice(0, 5).map((member, index) => (
              <div 
                key={member.user_id} 
                className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-400">#{index + 1}</span>
                  <span className="text-white truncate max-w-[120px]">{member.full_name}</span>
                </div>
                <span className="text-yellow-400 font-semibold">
                  {member.lifetime_points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {members.length === 0 && (
            <p className="text-center text-slate-400">No members found</p>
          )}
        </div>
      </div>

      {/* Member Points Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-bold text-white">Member Points</h2>

        {members.length === 0 ? (
          <p className="mt-4 text-center text-slate-400">No members found</p>
        ) : (
          <div className="mt-4 w-full overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Member
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Level
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Monthly
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Lifetime
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.user_id} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-sm text-white">
                      {member.full_name}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-400">
                      Level {member.membership_level}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {member.monthly_points.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-yellow-400">
                      {member.lifetime_points.toLocaleString()}
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