"use client";

import { Award, Coins, Users, TrendingUp, Gift, Star } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type ProfileStatsProps = {
  points: number;
  total_earnings: number;
  monthly_points: number;
  lifetime_points: number;
  direct_referrals: number;
  indirect_referrals: number;
  userLevel?: number;
};

export default function ProfileStats({
  points,
  total_earnings,
  monthly_points,
  lifetime_points,
  direct_referrals,
  indirect_referrals,
  userLevel = 1,
}: ProfileStatsProps) {
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBorder = levelData.borderColor;

  const stats = [
    {
      label: "Available Points",
      value: points.toLocaleString(),
      icon: Coins,
      color: levelColor,
      bg: `${levelData.bgColor} bg-opacity-10`,
    },
    {
      label: "Total Earnings",
      value: `₦${total_earnings.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Monthly Points",
      value: monthly_points.toLocaleString(),
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Lifetime Points",
      value: lifetime_points.toLocaleString(),
      icon: Award,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Direct Referrals",
      value: direct_referrals,
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Indirect Referrals",
      value: indirect_referrals,
      icon: Gift,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        // First stat (Available Points) uses level color
        const isFirstStat = index === 0;
        return (
          <div
            key={index}
            className={`rounded-xl border ${isFirstStat ? levelBorder : "border-slate-800"} bg-slate-900/50 p-4 shadow-xl backdrop-blur transition hover:border-slate-700`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                <p className={`mt-1 text-lg font-bold md:text-xl ${isFirstStat ? levelColor : "text-white"}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-lg ${stat.bg} p-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}