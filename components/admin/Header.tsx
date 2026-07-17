"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Bell, LogOut, Menu, X } from "lucide-react";
import AdminNotificationsButton from "@/components/admin/AdminNotificationsButton";
import { getLevel } from "@/lib/constants/levels";

type HeaderProps = {
  profile: any;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
};

export default function Header({ profile, onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const router = useRouter();
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("K-NETWORK");

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

  const handleLogout = async () => {
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

  const levelId = profile?.membership_level || 1;
  const levelData = getLevel(levelId);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  // Render logo
  const renderLogo = () => {
    if (siteLogo) {
      return (
        <div className="relative h-8 w-8 flex-shrink-0">
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
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${levelBg} font-bold text-white`}>
        K
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-2">
            {renderLogo()}
            <div>
              <h1 className="text-lg font-bold text-white">{siteName}</h1>
              <p className={`text-xs ${levelColor}`}>Admin Panel</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Notifications Button - Using the new component */}
          <AdminNotificationsButton />

          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{profile?.full_name}</p>
            <p className={`text-xs ${levelColor}`}>Administrator</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}