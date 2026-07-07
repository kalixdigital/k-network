"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Bell, LogOut, Menu, X } from "lucide-react";

type HeaderProps = {
  profile: any;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
};

export default function Header({ profile, onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const router = useRouter();

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white">
              K
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">K-NETWORK</h1>
              <p className="text-xs text-emerald-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative rounded-full border border-slate-700 p-2 transition hover:bg-slate-800"
            onClick={() => showToast.info("Notifications coming soon!")}
          >
            <Bell className="h-4 w-4 text-slate-400" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{profile?.full_name}</p>
            <p className="text-xs text-emerald-400">Administrator</p>
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