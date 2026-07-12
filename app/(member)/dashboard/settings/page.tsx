"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Lock,
  Moon,
  Sun,
  Globe,
  Smartphone,
  LogOut,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  membership_level: number;
  is_active: boolean;
  is_verified: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, membership_level, is_active, is_verified")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setUserLevel(data.membership_level || 1);
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      showToast.error("Failed to logout");
    }
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className={`h-8 w-8 animate-spin ${levelColor} mx-auto`} />
          <p className="text-slate-400 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Profile",
      icon: User,
      items: [
        {
          label: "Edit Profile",
          description: "Update your personal information",
          href: "/dashboard/profile",
          icon: User,
        },
        {
          label: "Change Password",
          description: "Update your password",
          href: "/dashboard/change-password",
          icon: Lock,
        },
      ],
    },
    {
      title: "Preferences",
      icon: Globe,
      items: [
        {
          label: "Notifications",
          description: "Manage your notification preferences",
          href: "/dashboard/notifications",
          icon: Bell,
        },
        {
          label: "Language",
          description: "Change your language preference",
          href: "#",
          icon: Globe,
        },
        {
          label: "Theme",
          description: "Switch between light and dark mode",
          href: "#",
          icon: Sun,
        },
      ],
    },
    {
      title: "Security",
      icon: Shield,
      items: [
        {
          label: "Two-Factor Authentication",
          description: "Add an extra layer of security",
          href: "#",
          icon: Shield,
        },
        {
          label: "Sessions",
          description: "Manage your active sessions",
          href: "#",
          icon: Smartphone,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-400">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className={`rounded-2xl border ${levelData.borderColor} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${levelData.bgColor} text-2xl font-bold text-white`}>
              {profile.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">{profile.full_name}</h2>
              <p className="text-sm text-slate-400">{profile.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className={`text-xs ${levelColor}`}>
                  {levelData.name}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className={`text-xs ${profile.is_active && profile.is_verified ? "text-emerald-400" : "text-yellow-400"}`}>
                  {profile.is_active && profile.is_verified ? "Active" : "Pending"}
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`h-5 w-5 ${levelColor}`} />
                <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-800/50 group"
                    >
                      <div className={`rounded-lg ${levelData.badgeBg} p-2`}>
                        <ItemIcon className={`h-4 w-4 ${levelData.badgeText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl border border-red-500/20 bg-red-950/10 p-4 text-red-400 hover:bg-red-950/20 transition flex items-center justify-center gap-2"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Sign Out</span>
      </button>

      {/* Version Info */}
      <div className="text-center">
        <p className="text-xs text-slate-500">K-NETWORK v1.0.0</p>
      </div>
    </div>
  );
}