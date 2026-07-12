"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Coins } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type MonthlyEarning = {
  month: string;
  year: number;
  points: number;
  earnings: number;
  referrals: number;
};

export default function EarningsChart() {
  const [data, setData] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [trend, setTrend] = useState<{ value: number; isPositive: boolean }>({
    value: 0,
    isPositive: true,
  });

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
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

      // Get monthly statistics for the last 6 months
      const now = new Date();
      const months: MonthlyEarning[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const { data, error } = await supabase
          .from("monthly_statistics")
          .select("monthly_points, monthly_earnings, active_direct_referrals")
          .eq("user_id", user.id)
          .eq("month", month)
          .eq("year", year)
          .maybeSingle();

        if (error) {
          console.error("Error loading monthly stats for", month, year, error);
        }

        months.push({
          month: date.toLocaleString("default", { month: "short" }),
          year: year,
          points: data?.monthly_points || 0,
          earnings: data?.monthly_earnings || 0,
          referrals: data?.active_direct_referrals || 0,
        });
      }

      setData(months);

      // Calculate totals
      const totalE = months.reduce((sum, m) => sum + m.earnings, 0);
      const totalP = months.reduce((sum, m) => sum + m.points, 0);
      setTotalEarnings(totalE);
      setTotalPoints(totalP);

      // Calculate trend (compare last month to previous)
      if (months.length >= 2) {
        const current = months[months.length - 1].earnings;
        const previous = months[months.length - 2].earnings;
        
        if (previous === 0) {
          setTrend({ value: current > 0 ? 100 : 0, isPositive: true });
        } else {
          const change = ((current - previous) / previous) * 100;
          setTrend({
            value: Math.abs(Math.round(change)),
            isPositive: change >= 0,
          });
        }
      }
    } catch (error) {
      console.error("Error loading earnings data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Find max value for chart scaling
  const maxEarnings = Math.max(...data.map((d) => d.earnings), 1);
  const maxPoints = Math.max(...data.map((d) => d.points), 1);

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
        <div className="flex items-center justify-center py-8 md:py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent md:h-8 md:w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={`h-4 w-4 md:h-5 md:w-5 ${levelColor}`} />
          <h2 className="text-base font-semibold text-white md:text-lg">Earnings Overview</h2>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 flex items-center gap-1 md:text-xs">
              <DollarSign className="h-3 w-3" />
              Total
            </p>
            <p className={`text-sm font-bold md:text-lg ${levelColor}`}>
              ₦{totalEarnings.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 flex items-center gap-1 md:text-xs">
              <Coins className="h-3 w-3" />
              Points
            </p>
            <p className="text-sm font-bold text-yellow-400 md:text-lg">
              {totalPoints.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {trend.isPositive ? (
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-400" />
        )}
        <span
          className={`text-xs font-medium md:text-sm ${
            trend.isPositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trend.isPositive ? "↑" : "↓"} {trend.value}% from last month
        </span>
        <span className="text-[10px] text-slate-500 flex items-center gap-1 md:text-xs">
          <Calendar className="h-3 w-3" />
          Last 6 months
        </span>
      </div>

      {/* Bar Chart */}
      <div className="mt-4">
        <div className="flex h-40 items-end gap-1 md:h-48 md:gap-2">
          {data.map((item, index) => {
            const heightPercentage = (item.earnings / maxEarnings) * 100;
            const pointsPercentage = (item.points / maxPoints) * 100;
            const isHighest = item.earnings === maxEarnings && maxEarnings > 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex flex-col items-center gap-1">
                  {/* Earnings Bar */}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      isHighest
                        ? `bg-gradient-to-t ${levelColor.replace('text-', 'from-')} to-teal-400`
                        : `bg-gradient-to-t ${levelColor.replace('text-', 'from-')}/50 to-${levelColor.replace('text-', '')}/30`
                    }`}
                    style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                  />
                  {/* Points Bar (smaller, on top) */}
                  <div
                    className="absolute bottom-0 w-1/2 rounded-t-lg bg-yellow-400/30 transition-all duration-700"
                    style={{ height: `${Math.max(pointsPercentage * 0.6, 1)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] font-medium text-slate-400 md:mt-2">
                  {item.month}
                </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 md:mt-4 md:gap-6">
          <div className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${levelBg}`} />
            <span className="text-xs text-slate-400">Earnings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-yellow-400/30" />
            <span className="text-xs text-slate-400">Points</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${levelBg}`} />
            <span className="text-xs text-slate-400">Highest</span>
          </div>
        </div>
      </div>

      {/* Monthly Details */}
      <div className="mt-4 grid grid-cols-3 gap-2 md:mt-6">
        {data.slice(-3).map((item, index) => (
          <div
            key={index}
            className="rounded-lg bg-slate-800/30 p-2 text-center md:p-3"
          >
            <p className="text-[10px] text-slate-500 md:text-xs">{item.month}</p>
            <p className={`text-xs font-semibold md:text-sm ${levelColor}`}>
              ₦{item.earnings.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 md:text-xs">
              {item.referrals} referrals
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}