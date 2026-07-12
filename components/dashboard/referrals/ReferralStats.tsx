"use client";

import { Users, UserPlus, Gift, TrendingUp, Clock } from "lucide-react";

type ReferralStatsProps = {
  directReferrals: number;
  indirectReferrals: number;
  totalReferrals: number;
  activeReferrals: number;
  referralEarnings: number;
  referralPoints: number;
};

export default function ReferralStats({
  directReferrals,
  indirectReferrals,
  totalReferrals,
  activeReferrals,
  referralEarnings,
  referralPoints,
}: ReferralStatsProps) {
  const stats = [
    {
      label: "Direct Referrals",
      value: directReferrals,
      icon: UserPlus,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Indirect Referrals",
      value: indirectReferrals,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Referrals",
      value: totalReferrals,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Referrals",
      value: activeReferrals,
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Referral Earnings",
      value: `₦${referralEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Referral Points",
      value: referralPoints.toLocaleString(),
      icon: Gift,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur transition hover:border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                <p className="mt-1 text-lg font-bold text-white md:text-xl">{stat.value}</p>
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