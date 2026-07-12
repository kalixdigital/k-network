"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Bell, BellRing } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";
import { getUnreadNotifications } from "@/lib/services/notificationService";

export default function AdminNotificationsButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      // Check if supabase client is available
      if (!supabase) {
        console.warn("Supabase client not available");
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.warn("User fetch error:", userError.message);
        setIsLoading(false);
        return;
      }

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get user level for theming
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("membership_level")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setUserLevel(profile.membership_level || 1);
        }
      } catch (profileError) {
        console.warn("Profile fetch error:", profileError);
        // Continue with default level
      }

      // Use the service to get unread notifications
      try {
        const notifications = await getUnreadNotifications(user.id);
        setUnreadCount(notifications.length);
      } catch (notifError) {
        console.warn("Notifications fetch error:", notifError);
        // Keep existing count
      }
    } catch (error) {
      console.warn("Error loading unread count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  // Don't show anything if still loading
  if (isLoading) {
    return (
      <div className="relative rounded-full border border-slate-700 p-1.5 md:p-2">
        <Bell className="h-4 w-4 text-slate-400 md:h-5 md:w-5" />
      </div>
    );
  }

  return (
    <Link
      href="/admin/notifications"
      className="relative rounded-full border border-slate-700 p-1.5 transition hover:bg-slate-800 md:p-2"
      aria-label="Admin Notifications"
    >
      {unreadCount > 0 ? (
        <BellRing className={`h-4 w-4 md:h-5 md:w-5 ${levelColor}`} />
      ) : (
        <Bell className="h-4 w-4 text-slate-400 md:h-5 md:w-5" />
      )}
      {unreadCount > 0 && (
        <span className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${levelBg} text-[8px] font-bold text-white md:h-5 md:w-5 md:text-[10px] animate-in fade-in zoom-in-95 duration-200`}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}