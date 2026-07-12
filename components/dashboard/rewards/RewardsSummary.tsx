"use client";

import { TrendingUp, Users, ShoppingBag, Award, Crown, Star } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type RewardsSummaryProps = {
  totalPoints: number;
  referralPoints: number;
  purchasePoints: number;
  levelBonusPoints: number;
  monthlyPoints: number;
  nextLevelPoints: number;
  userLevel?: number;
};

export default function RewardsSummary({
  totalPoints,
  referralPoints,
  purchasePoints,
  levelBonusPoints,
  monthlyPoints,
  nextLevelPoints,
  userLevel = 1,
}: RewardsSummaryProps) {
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  const items = [
    {
      label: "Referral Rewards",
      value: referralPoints.toLocaleString(),
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      percentage: totalPoints > 0 ? Math.round((referralPoints / totalPoints) * 100) : 0,
    },
    {
      label: "Purchase Rewards",
      value: purchasePoints.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      percentage: totalPoints > 0 ? Math.round((purchasePoints / totalPoints) * 100) : 0,
    },
    {
      label: "Level Bonuses",
      value: levelBonusPoints.toLocaleString(),
      icon: Crown,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      percentage: totalPoints > 0 ? Math.round((levelBonusPoints / totalPoints) * 100) : 0,
    },
  ];

  return (
    <div className={`rounded-2xl border ${levelData.borderColor} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Rewards Breakdown</h2>
          <p className="text-sm text-slate-400">How you earned your points</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Monthly Progress</p>
          <p className={`text-sm font-bold ${levelColor}`}>
            {monthlyPoints.toLocaleString()} pts
            {nextLevelPoints > 0 && (
              <span className="text-xs text-slate-400 font-normal ml-1">
                / {nextLevelPoints.toLocaleString()} to next level
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg ${item.bg} p-1.5`}>
                    <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value} pts</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    item.percentage > 0 ? `bg-gradient-to-r ${getGradientColor(index, levelData)}` : ''
                  }`}
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Total Points</span>
          <span className={`text-lg font-bold ${levelColor}`}>{totalPoints.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function getGradientColor(index: number, levelData: any): string {
  // Use level color for the first item (Referral Rewards) to match theme
  const levelColorName = levelData.bgColor.replace('bg-', '').replace('-500', '');
  
  const gradients = [
    `from-${levelColorName}-500 to-${levelColorName}-400`,
    "from-blue-500 to-blue-400",
    "from-yellow-500 to-yellow-400",
  ];
  return gradients[index % gradients.length] || `from-${levelColorName}-500 to-${levelColorName}-400`;
}