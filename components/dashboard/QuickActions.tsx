"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Users,
  Wallet,
  User,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Buy Products",
      href: "/products",
      icon: ShoppingBag,
    },
    {
      title: "Referrals",
      href: "/dashboard/referrals",
      icon: Users,
    },
    {
      title: "Earnings",
      href: "/dashboard/earnings",
      icon: Wallet,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-white">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-500 hover:bg-slate-800"
            >
              <Icon className="mx-auto h-8 w-8 text-emerald-400" />

              <p className="mt-3 text-center font-semibold text-white">
                {action.title}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
