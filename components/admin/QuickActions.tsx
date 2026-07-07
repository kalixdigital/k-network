"use client";

import Link from "next/link";
import { ShoppingBag, Package, Users, Settings } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "View Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      color: "emerald",
    },
    {
      title: "Add Product",
      href: "/admin/products/new",
      icon: Package,
      color: "blue",
    },
    {
      title: "Manage Users",
      href: "/admin/members",
      icon: Users,
      color: "purple",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      color: "amber",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10";
      case "blue":
        return "border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10";
      case "purple":
        return "border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10";
      case "amber":
        return "border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10";
      default:
        return "border-slate-800 hover:border-slate-700 hover:bg-slate-800";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-xl font-bold text-white">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`rounded-xl border ${getColorClasses(
                action.color
              )} bg-slate-900/50 p-4 text-center transition hover:scale-105`}
            >
              <Icon className="mx-auto h-6 w-6 text-emerald-400" />
              <p className="mt-2 text-sm font-medium text-white">
                {action.title}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}