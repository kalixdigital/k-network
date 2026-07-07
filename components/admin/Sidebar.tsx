"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  Wallet,
  GitBranch,
  Activity,
  FileBarChart,
  FileText,
} from "lucide-react";

type SidebarProps = {
  pathname: string;
  isMobileMenuOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ pathname, isMobileMenuOpen, onClose }: SidebarProps) {
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/members", label: "Members", icon: Users },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
    { href: "/admin/commissions", label: "Commissions", icon: TrendingUp },
    { href: "/admin/genealogy", label: "Genealogy", icon: GitBranch },
    { href: "/admin/activities", label: "Activities", icon: Activity },
    { href: "/admin/reports", label: "Reports", icon: FileBarChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed bottom-0 left-0 top-[65px] z-40 w-64 transform border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <nav className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <span>←</span>
            Back to Site
          </Link>
        </div>
      </nav>
    </aside>
  );
}