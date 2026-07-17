"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import { 
  Bell, 
  LogOut, 
  User, 
  Settings, 
  LayoutDashboard,
  Users,
  HelpCircle,
  ChevronDown,
  Gift,
  GitBranch,
  CircleUser,
  TrendingUp
} from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("K-NETWORK");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUser(user);

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, membership_level, role, avatar_url")
            .eq("id", user.id)
            .single();

          if (profile) {
            setProfile(profile);
          }
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Load company settings for logo
  useEffect(() => {
    async function loadCompanySettings() {
      try {
        const { data, error } = await supabase
          .from("company_settings")
          .select("site_logo, site_name")
          .eq("id", 1)
          .single();

        if (error) {
          console.error("Error loading company settings:", error);
          return;
        }

        if (data) {
          setSiteLogo(data.site_logo || null);
          if (data.site_name) setSiteName(data.site_name);
        }
      } catch (error) {
        console.error("Error loading company settings:", error);
      }
    }

    loadCompanySettings();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast.error("Logout failed: " + error.message);
        return;
      }
      showToast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      showToast.error("An error occurred during logout");
    }
  };

  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(path);
  };

  const levelId = profile?.membership_level || 1;
  const levelData = getLevel(levelId);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      show: true,
    },
    {
      label: "Points Engine",
      icon: TrendingUp,
      href: "/dashboard/points-engine",
      show: true,
    },
    {
      label: "My Profile",
      icon: User,
      href: "/dashboard/profile",
      show: true,
    },
    {
      label: "My Referrals",
      icon: Users,
      href: "/dashboard/referrals",
      show: true,
    },
    {
      label: "Genealogy",
      icon: GitBranch,
      href: "/dashboard/genealogy",
      show: true,
    },
    {
      label: "Rewards",
      icon: Gift,
      href: "/dashboard/rewards",
      show: true,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      show: true,
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      href: "/dashboard/support",  
      show: true,
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.show);

  // Get user avatar - always show user icon
  const renderAvatar = () => {
    if (loading) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      );
    }

    return (
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${levelBg} text-white`}>
        <CircleUser className="h-6 w-6" />
      </div>
    );
  };

  // Render logo - LARGER SIZE
  const renderLogo = () => {
    if (siteLogo) {
      return (
        <div className="relative h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
          <Image
            src={siteLogo}
            alt={siteName}
            fill
            className="object-contain"
            priority
          />
        </div>
      );
    }

    // Fallback to the "K" letter
    return (
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${levelBg} font-bold text-white md:h-12 md:w-12`}>
        K
      </div>
    );
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          {renderLogo()}
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-white md:text-xl">{siteName}</h1>
            <p className="text-xs text-slate-400">Member Dashboard</p>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications Panel */}
          <NotificationsPanel />

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-lg transition hover:opacity-80"
            >
              {renderAvatar()}
              <ChevronDown 
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isMenuOpen ? "rotate-180" : ""
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 py-2 shadow-2xl backdrop-blur-xl">
                {/* User Info Header */}
                {!loading && profile && (
                  <div className="border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${levelBg} text-white`}>
                        <CircleUser className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{profile.full_name}</p>
                        <p className={`text-sm ${levelColor}`}>
                          {levelData.name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>
                )}

                {/* Menu Items */}
                <div className="py-1">
                  {visibleMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <button
                        key={item.href}
                        onClick={() => navigateTo(item.href)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                          active
                            ? `${levelColor} font-semibold`
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${active ? levelColor : ""}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Divider and Logout */}
                <div className="border-t border-slate-800 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}