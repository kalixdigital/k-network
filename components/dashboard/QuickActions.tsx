"use client";

import Link from "next/link";
import { ShoppingBag, Users, Wallet, User, TrendingUp, Gift } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Buy Products",
      href: "/products",
      icon: ShoppingBag,
      color: "emerald",
      description: "Shop now",
    },
    {
      title: "Referrals",
      href: "/dashboard/referrals",
      icon: Users,
      color: "purple",
      description: "Invite friends",
    },
    {
      title: "Earnings",
      href: "/dashboard/earnings",
      icon: Wallet,
      color: "blue",
      description: "View earnings",
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
      color: "amber",
      description: "Manage account",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10";
      case "purple":
        return "border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10";
      case "blue":
        return "border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10";
      case "amber":
        return "border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10";
      default:
        return "border-slate-800 hover:border-slate-700 hover:bg-slate-800";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "emerald":
        return "text-emerald-400";
      case "purple":
        return "text-purple-400";
      case "blue":
        return "text-blue-400";
      case "amber":
        return "text-amber-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`rounded-2xl border ${getColorClasses(
                action.color
              )} bg-slate-900/50 p-4 transition-all backdrop-blur hover:scale-105 hover:shadow-lg`}
            >
              <Icon
                className={`mx-auto h-6 w-6 md:h-8 md:w-8 ${getIconColor(
                  action.color
                )}`}
              />
              <p className="mt-2 text-center text-sm font-semibold text-white">
                {action.title}
              </p>
              <p className="text-center text-xs text-slate-400">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}