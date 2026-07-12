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
  Crown,
  Package,
  AlertTriangle,
  UserPlus
} from "lucide-react";
import { getLevel } from "@/lib/constants/levels";
import { 
  getUnreadNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/lib/services/notificationService";
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

// Extended icons for admin
const notificationIcons: Record<string, React.ReactNode> = {
  referral: <Users className="h-3 w-3 text-purple-400 md:h-4 md:w-4" />,
  purchase: <ShoppingBag className="h-3 w-3 text-blue-400 md:h-4 md:w-4" />,
  points: <Award className="h-3 w-3 text-amber-400 md:h-4 md:w-4" />,
  withdrawal: <Gift className="h-3 w-3 text-emerald-400 md:h-4 md:w-4" />,
  system: <Bell className="h-3 w-3 text-slate-400 md:h-4 md:w-4" />,
  membership: <Crown className="h-3 w-3 text-yellow-400 md:h-4 md:w-4" />,
  order: <Package className="h-3 w-3 text-indigo-400 md:h-4 md:w-4" />,
  alert: <AlertTriangle className="h-3 w-3 text-red-400 md:h-4 md:w-4" />,
  user: <UserPlus className="h-3 w-3 text-emerald-400 md:h-4 md:w-4" />,
};

const notificationColors: Record<string, string> = {
  referral: "border-purple-500/20 bg-purple-950/20",
  purchase: "border-blue-500/20 bg-blue-950/20",
  points: "border-amber-500/20 bg-amber-950/20",
  withdrawal: "border-emerald-500/20 bg-emerald-950/20",
  system: "border-slate-500/20 bg-slate-950/20",
  membership: "border-yellow-500/20 bg-yellow-950/20",
  order: "border-indigo-500/20 bg-indigo-950/20",
  alert: "border-red-500/20 bg-red-950/20",
  user: "border-emerald-500/20 bg-emerald-950/20",
};

export default function AdminNotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);

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

      // Get admin level for theming
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_level")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setUserLevel(profile.membership_level || 1);
      }

      // Use the service to get unread notifications
      const data = await getUnreadNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Error loading admin notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const success = await markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
        showToast.success("All notifications marked as read");
      }
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

  // Get icon based on notification type and content
  const getIconForNotification = (notification: Notification) => {
    if (notification.type === "system") {
      if (notification.title?.includes("Order") || notification.title?.includes("📦")) {
        return notificationIcons.order;
      }
      if (notification.title?.includes("Alert") || notification.title?.includes("Low Stock") || notification.title?.includes("⚠️")) {
        return notificationIcons.alert;
      }
      if (notification.title?.includes("User") || notification.title?.includes("👤")) {
        return notificationIcons.user;
      }
    }
    return notificationIcons[notification.type] || notificationIcons.system;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-full border ${levelBorder} p-1.5 transition hover:bg-slate-800 md:p-2`}
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
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className={`absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-[420px] md:max-w-[420px] rounded-xl border ${levelBorder} bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden z-50 origin-top-right transition-all duration-200`}
            style={{ 
              right: '0px',
              left: 'auto',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5 md:px-4 md:py-3">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className={`h-4 w-4 flex-shrink-0 ${levelColor}`} />
                <h3 className="text-sm font-semibold text-white md:text-base truncate">Admin Alerts</h3>
                {unreadCount > 0 && (
                  <span className={`rounded-full ${levelBg} bg-opacity-20 px-1.5 py-0.5 text-[10px] ${levelColor} md:px-2 md:text-xs flex-shrink-0`}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
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

            {/* Notifications List */}
            <div className="max-h-[300px] overflow-y-auto md:max-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <div className={`h-5 w-5 animate-spin rounded-full border-2 ${levelBg} border-t-transparent md:h-6 md:w-6`} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center md:py-12">
                  <BellOff className="h-10 w-10 text-slate-600 md:h-12 md:w-12" />
                  <p className="mt-2 text-xs text-slate-400 md:mt-3 md:text-sm">No admin alerts</p>
                  <p className="text-[10px] text-slate-500 md:text-xs">
                    You'll be notified when something important happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {notifications.map((notification) => {
                    const Icon = getIconForNotification(notification);
                    const color = notificationColors[notification.type] || notificationColors.system;
                    const isUnread = !notification.is_read;

                    return (
                      <div
                        key={notification.id}
                        className={`group flex items-start gap-2 px-3 py-2.5 transition hover:bg-slate-800/50 md:gap-3 md:px-4 md:py-3 ${
                          isUnread ? `${levelBg} bg-opacity-5` : ""
                        }`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="relative flex-shrink-0">
                          <div className={`mt-0.5 rounded-full p-1 md:p-1.5 ${color}`}>
                            {Icon}
                          </div>
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
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className={`text-[10px] ${levelColor} hover:opacity-80 transition flex items-center justify-center gap-1 md:text-xs w-full`}
              >
                View all notifications
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}