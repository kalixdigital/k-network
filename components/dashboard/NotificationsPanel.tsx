"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  Bell, 
  X, 
  Clock, 
  Gift, 
  ShoppingBag, 
  Users, 
  Award,
  ChevronRight,
  BellRing,
  BellOff,
  Crown
} from "lucide-react";
import { getLevel } from "@/lib/constants/levels";
import Link from "next/link";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'referral' | 'purchase' | 'points' | 'withdrawal' | 'system' | 'membership';
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
};

const notificationIcons: Record<string, React.ReactNode> = {
  referral: <Users className="h-3 w-3 text-purple-400 md:h-4 md:w-4" />,
  purchase: <ShoppingBag className="h-3 w-3 text-blue-400 md:h-4 md:w-4" />,
  points: <Award className="h-3 w-3 text-amber-400 md:h-4 md:w-4" />,
  withdrawal: <Gift className="h-3 w-3 text-emerald-400 md:h-4 md:w-4" />,
  system: <Bell className="h-3 w-3 text-slate-400 md:h-4 md:w-4" />,
  membership: <Crown className="h-3 w-3 text-yellow-400 md:h-4 md:w-4" />,
};

const notificationColors: Record<string, string> = {
  referral: "border-purple-500/20 bg-purple-950/20",
  purchase: "border-blue-500/20 bg-blue-950/20",
  points: "border-amber-500/20 bg-amber-950/20",
  withdrawal: "border-emerald-500/20 bg-emerald-950/20",
  system: "border-slate-500/20 bg-slate-950/20",
  membership: "border-yellow-500/20 bg-yellow-950/20",
};

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    loadNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_level")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setUserLevel(profile.membership_level || 1);
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id, user_id, title, description, type, is_read, created_at, metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Notifications fetch error:", error);
        setLoading(false);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      showToast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      showToast.error("Failed to mark all as read");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  const levelBorder = levelData.borderColor;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-full border ${levelBorder} p-1.5 transition hover:bg-slate-800 md:p-2`}
        aria-label="Notifications"
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
      </button>

      {/* Dropdown Panel - Fixed Mobile Positioning */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 
            Fix 1 & 2: Better mobile positioning
            - Centered on mobile (fixed positioning)
            - Dropdown on desktop (absolute positioning)
          */}
          <div 
            className={`
              fixed top-16 left-1/2 -translate-x-1/2 
              w-[92vw] max-w-sm 
              rounded-xl border ${levelBorder} 
              bg-slate-900/95 shadow-2xl backdrop-blur-xl 
              overflow-hidden 
              z-[9999] 
              transition-all duration-200
              lg:absolute lg:right-2 lg:left-auto lg:top-full lg:mt-3 lg:w-[380px] lg:max-w-[380px] lg:-translate-x-0
              origin-top-right
            `}
          >
            {/* Fix 5: Horizontal padding for very small screens */}
            <div className="px-2 sm:px-0">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5 md:px-4 md:py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className={`h-4 w-4 flex-shrink-0 ${levelColor}`} />
                  <h3 className="text-sm font-semibold text-white md:text-base truncate">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className={`rounded-full ${levelBg} bg-opacity-20 px-1.5 py-0.5 text-[10px] ${levelColor} md:px-2 md:text-xs flex-shrink-0`}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className={`text-[10px] ${levelColor} hover:opacity-80 transition md:text-xs whitespace-nowrap`}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1 hover:bg-slate-800 transition"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400 md:h-4 md:w-4" />
                  </button>
                </div>
              </div>

              {/* Fix 4: Increased max height */}
              <div className="max-h-[70vh] md:max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8 md:py-12">
                    <div className={`h-5 w-5 animate-spin rounded-full border-2 ${levelBg} border-t-transparent md:h-6 md:w-6`} />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center md:py-12">
                    <BellOff className="h-10 w-10 text-slate-600 md:h-12 md:w-12" />
                    <p className="mt-2 text-xs text-slate-400 md:mt-3 md:text-sm">No notifications yet</p>
                    <p className="text-[10px] text-slate-500 md:text-xs">
                      We'll notify you when something important happens
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {notifications.map((notification) => {
                      const Icon = notificationIcons[notification.type] || notificationIcons.system;
                      const color = notificationColors[notification.type] || notificationColors.system;
                      const isUnread = !notification.is_read;
                      const isMembership = notification.type === "membership";

                      return (
                        <div
                          key={notification.id}
                          className={`group flex items-start gap-2 px-3 py-2.5 transition hover:bg-slate-800/50 md:gap-3 md:px-4 md:py-3 ${
                            isUnread ? `${levelBg} bg-opacity-5` : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          {/* Icon */}
                          <div className="relative flex-shrink-0">
                            <div className={`mt-0.5 rounded-full p-1 md:p-1.5 ${color}`}>
                              {Icon}
                            </div>
                            {isMembership && (
                              <div className="absolute -top-1 -right-1">
                                <span className="flex h-2.5 w-2.5 md:h-3 md:w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400 md:h-3 md:w-3"></span>
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1 md:gap-2">
                              <p className={`text-xs ${isUnread ? "font-semibold text-white" : "text-slate-300"} md:text-sm break-words`}>
                                {notification.title}
                              </p>
                              {isUnread && (
                                <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${levelBg} md:h-2 md:w-2`} />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 md:text-xs line-clamp-2 break-words">
                              {notification.description}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 md:mt-1 md:text-xs">
                              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 px-3 py-1.5 text-center md:px-4 md:py-2">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className={`text-[10px] ${levelColor} hover:opacity-80 transition flex items-center justify-center gap-1 md:text-xs w-full`}
                >
                  View all notifications
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}