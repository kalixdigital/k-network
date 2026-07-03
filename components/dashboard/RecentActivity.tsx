"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Clock, UserPlus, ShoppingBag, Star, Gift } from "lucide-react";

type Activity = {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "account":
      return <UserPlus className="h-4 w-4 text-emerald-400" />;
    case "purchase":
      return <ShoppingBag className="h-4 w-4 text-blue-400" />;
    case "referral":
      return <Gift className="h-4 w-4 text-purple-400" />;
    case "points":
      return <Star className="h-4 w-4 text-amber-400" />;
    default:
      return <Clock className="h-4 w-4 text-slate-400" />;
  }
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTable, setHasTable] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("User fetch error:", userError);
          setLoading(false);
          return;
        }

        if (!user) {
          setLoading(false);
          return;
        }

        // Check if activities table exists by trying to select from it
        const { error: tableCheckError } = await supabase
          .from("activities")
          .select("count", { count: "exact", head: true });

        if (tableCheckError) {
          console.error("Activities table may not exist:", tableCheckError);
          setHasTable(false);
          setLoading(false);
          
          // Only show toast if it's not a "relation doesn't exist" error
          if (!tableCheckError.message?.includes("does not exist")) {
            showToast.warning("Activity feed temporarily unavailable");
          }
          return;
        }

        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Activity fetch error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          setLoading(false);
          return;
        }

        setActivities(data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading activities:", err);
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

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

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!hasTable) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-400">Activity feed coming soon</p>
            <p className="text-xs text-slate-500">Activities will appear here once available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <span className="text-xs text-slate-400">{activities.length} activities</span>
      </div>

      <div className="mt-4 space-y-3">
        {activities.length === 0 ? (
          <div className="rounded-xl bg-slate-800/50 p-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-400">No activity yet</p>
            <p className="text-xs text-slate-500">
              Start exploring to see your activity here
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-xl bg-slate-800/50 p-4 transition hover:bg-slate-800"
            >
              <div className="mt-0.5 rounded-full bg-slate-700 p-1.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-white">
                  {activity.title}
                </h3>
                <p className="text-sm text-slate-400 truncate">
                  {activity.description}
                </p>
              </div>
              <p className="flex-shrink-0 text-xs text-slate-500">
                {formatDate(activity.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}