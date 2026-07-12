"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import { 
  ArrowLeft,
  Bell, 
  BellRing, 
  BellOff,
  Clock, 
  Gift, 
  ShoppingBag, 
  Users, 
  Award,
  Crown,
  CheckCircle,
  Loader2,
  Trash2
} from "lucide-react";
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
  referral: <Users className="h-4 w-4 text-purple-400" />,
  purchase: <ShoppingBag className="h-4 w-4 text-blue-400" />,
  points: <Award className="h-4 w-4 text-amber-400" />,
  withdrawal: <Gift className="h-4 w-4 text-emerald-400" />,
  system: <Bell className="h-4 w-4 text-slate-400" />,
  membership: <Crown className="h-4 w-4 text-yellow-400" />,
};

const notificationColors: Record<string, string> = {
  referral: "border-purple-500/20 bg-purple-950/20",
  purchase: "border-blue-500/20 bg-blue-950/20",
  points: "border-amber-500/20 bg-amber-950/20",
  withdrawal: "border-emerald-500/20 bg-emerald-950/20",
  system: "border-slate-500/20 bg-slate-950/20",
  membership: "border-yellow-500/20 bg-yellow-950/20",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
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

      // Get user's membership level for theming
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
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
      showToast.error("Failed to load notifications");
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
      showToast.error("Failed to mark as read");
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

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      showToast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast.error("Failed to delete notification");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  const levelBorder = levelData.borderColor;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className={`h-8 w-8 animate-spin ${levelColor} mx-auto`} />
          <p className="text-slate-400 mt-4">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-slate-400">
              {unreadCount} unread notifications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className={`rounded-lg border ${levelBorder} px-4 py-2 text-sm font-medium ${levelColor} hover:bg-slate-800 transition`}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-12 text-center shadow-xl backdrop-blur`}>
          <BellOff className="h-16 w-16 text-slate-600 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-white">No notifications</h3>
          <p className="text-sm text-slate-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || notificationIcons.system;
            const color = notificationColors[notification.type] || notificationColors.system;
            const isUnread = !notification.is_read;

            return (
              <div
                key={notification.id}
                className={`rounded-xl border p-4 transition ${
                  isUnread 
                    ? `${levelBorder} ${levelBg} bg-opacity-10` 
                    : 'border-slate-800 bg-slate-900/30 opacity-70'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`rounded-full p-2 ${color} flex-shrink-0`}>
                    {Icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isUnread && (
                          <span className={`text-xs ${levelColor}`}>● New</span>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(notification.created_at)}
                      </span>
                      {!isUnread && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Read
                        </span>
                      )}
                      {isUnread && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className={`text-xs ${levelColor} hover:opacity-80 transition`}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}