"use client";

import { Coins, Star, TrendingUp, Award, Gift, Users } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type RewardsStatsProps = {
  totalPoints: number;
  monthlyPoints: number;
  lifetimePoints: number;
  totalEarnings: number;
  referralBonus: number;
  levelBonus: number;
  userLevel?: number;
};

export default function RewardsStats({
  totalPoints,
  monthlyPoints,
  lifetimePoints,
  totalEarnings,
  referralBonus,
  levelBonus,
  userLevel = 1,
}: RewardsStatsProps) {
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  const stats = [
    {
      label: "Total Points",
      value: totalPoints.toLocaleString(),
      icon: Coins,
      color: levelColor,
      bg: `${levelBg} bg-opacity-10`,
    },
    {
      label: "Monthly Points",
      value: monthlyPoints.toLocaleString(),
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Lifetime Points",
      value: lifetimePoints.toLocaleString(),
      icon: Award,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Earnings",
      value: `₦${totalEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Referral Bonus",
      value: referralBonus.toLocaleString(),
      icon: Gift,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
    {
      label: "Level Bonus",
      value: levelBonus.toLocaleString(),
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        // First stat (Total Points) uses level color
        const isFirstStat = index === 0;
        return (
          <div
            key={index}
            className={`rounded-xl border ${isFirstStat ? levelData.borderColor : "border-slate-800"} bg-slate-900/50 p-4 shadow-xl backdrop-blur transition hover:border-slate-700`}
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