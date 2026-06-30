"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ShoppingBag,
  Users,
  Wallet,
  User,
} from "lucide-react";

const items = [
  {
    name: "Home",
    href: "/dashboard",
    icon: House,
  },
  {
    name: "Products",
    href: "/products",
    icon: ShoppingBag,
  },
  {
    name: "Referrals",
    href: "/dashboard/referrals",
    icon: Users,
  },
  {
    name: "Earnings",
    href: "/dashboard/earnings",
    icon: Wallet,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl md:hidden">

      <div className="grid grid-cols-5">

        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-3 text-xs transition ${
                active
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={22} />
              <span className="mt-1">{item.name}</span>
            </Link>
          );
        })}

      </div>

    </nav>
  );
}
