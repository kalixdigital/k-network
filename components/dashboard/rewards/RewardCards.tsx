"use client";

import { Users, ShoppingBag, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

type RewardCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  href: string;
  color: string;
  bg: string;
};

const rewardCards: RewardCardProps[] = [
  {
    title: "Referral Program",
    description: "Earn points for every successful referral",
    icon: <Users className="h-6 w-6" />,
    action: "Invite Friends",
    href: "/dashboard/referrals",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Shop & Earn",
    description: "Earn points on every purchase you make",
    icon: <ShoppingBag className="h-6 w-6" />,
    action: "Start Shopping",
    href: "/products",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Level Rewards",
    description: "Unlock bonus rewards as you level up",
    icon: <Award className="h-6 w-6" />,
    action: "View Levels",
    href: "/dashboard/levels",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

export default function RewardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rewardCards.map((card, index) => {
        return (
          <Link
            key={index}
            href={card.href}
            className="group rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur transition hover:border-slate-700 hover:bg-slate-800/30"
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-lg ${card.bg} p-2.5`}>
                <div className={card.color}>{card.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">{card.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition">
                  {card.action}
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}