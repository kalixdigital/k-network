import { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Users,
  Activity,
  ChevronRight,
  DollarSign,
  BarChart3,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Reports | Admin | K-NETWORK",
  description: "View analytics and reports",
};

export default function ReportsPage() {
  const reportSections = [
    {
      title: "Sales Reports",
      description: "Revenue, orders, and sales analytics",
      href: "/admin/reports/sales",
      icon: DollarSign,
      color: "emerald",
    },
    {
      title: "Commission Reports",
      description: "Commission payouts and earnings",
      href: "/admin/reports/commissions",
      icon: TrendingUp,
      color: "blue",
    },
    {
      title: "Points Reports",
      description: "Points earned, redeemed, and balances",
      href: "/admin/reports/points",
      icon: Award,
      color: "yellow",
    },
    {
      title: "Member Reports",
      description: "Member growth, activity, and engagement",
      href: "/admin/reports/members",
      icon: Users,
      color: "purple",
    },
    {
      title: "Activity Logs",
      description: "System and user activity logs",
      href: "/admin/activities",
      icon: Activity,
      color: "red",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reportSections.map((section) => {
        const Icon = section.icon;
        const colorClasses = {
          emerald: "border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10",
          blue: "border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10",
          yellow: "border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10",
          purple: "border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10",
          red: "border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10",
        };

        return (
          <Link
            key={section.href}
            href={section.href}
            className={`rounded-2xl border p-6 transition ${colorClasses[section.color as keyof typeof colorClasses]}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {section.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}