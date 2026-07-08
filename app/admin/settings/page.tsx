import { Metadata } from "next";
import Link from "next/link";
import {
  Settings,
  CreditCard,
  Award,
  Users,
  Shield,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | Admin | K-NETWORK",
  description: "Configure your K-NETWORK platform",
};

export default function SettingsPage() {
  const settingsSections = [
    {
      title: "General Settings",
      description: "Site name, logo, contact information",
      href: "/admin/settings/general",
      icon: Settings,
      color: "emerald",
    },
    {
      title: "Payment Settings",
      description: "Bank details, payment methods, withdrawal limits",
      href: "/admin/settings/payment",
      icon: CreditCard,
      color: "blue",
    },
    {
      title: "Points Settings",
      description: "Point value, earning rates, referral bonuses",
      href: "/admin/settings/points",
      icon: Award,
      color: "yellow",
    },
    {
      title: "Membership Settings",
      description: "Membership levels, requirements, and benefits",
      href: "/admin/settings/membership",
      icon: Users,
      color: "purple",
    },
    {
      title: "Security Settings",
      description: "Password policies, session timeout, admin access",
      href: "/admin/settings/security",
      icon: Shield,
      color: "red",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {settingsSections.map((section) => {
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