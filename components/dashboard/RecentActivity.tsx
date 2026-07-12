"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Clock, UserPlus, ShoppingBag, Star, Gift, Award, Shield, Zap } from "lucide-react";

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
      return <UserPlus className="h-3 w-3 text-emerald-400 md:h-4 md:w-4" />;
    case "activation":
      return <Zap className="h-3 w-3 text-yellow-400 md:h-4 md:w-4" />;
    case "purchase":
    case "order":
      return <ShoppingBag className="h-3 w-3 text-blue-400 md:h-4 md:w-4" />;
    case "referral":
      return <Gift className="h-3 w-3 text-purple-400 md:h-4 md:w-4" />;
    case "membership":
      return <Shield className="h-3 w-3 text-amber-400 md:h-4 md:w-4" />;
    case "points":
      return <Star className="h-3 w-3 text-amber-400 md:h-4 md:w-4" />;
    default:
      return <Clock className="h-3 w-3 text-slate-400 md:h-4 md:w-4" />;
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

        const { error: tableCheckError } = await supabase
          .from("activities")
          .select("count", { count: "exact", head: true });

        if (tableCheckError) {
          console.error("Activities table may not exist:", tableCheckError);
          setHasTable(false);
          setLoading(false);
          
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
          console.error("Activity fetch error:", error);
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 h-full">
        <div className="flex items-center justify-center py-6 md:py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent md:h-8 md:w-8" />
        </div>
      </div>
    );
  }

  if (!hasTable) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 h-full">
        <div className="flex items-center justify-center py-6 md:py-8">
          <div className="text-center">
            <Clock className="mx-auto h-6 w-6 text-slate-400 md:h-8 md:w-8" />
            <p className="mt-2 text-xs text-slate-400 md:text-sm">Activity feed coming soon</p>
            <p className="text-[10px] text-slate-500 md:text-xs">Activities will appear here once available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur h-full md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white md:text-lg">Recent Activity</h2>
        <span className="text-[10px] text-slate-400 md:text-xs">{activities.length} activities</span>
      </div>

      <div className="mt-3 space-y-2 md:mt-4 md:space-y-3">
        {activities.length === 0 ? (
          <div className="rounded-xl bg-slate-800/50 p-4 text-center md:p-6">
            <Clock className="mx-auto h-6 w-6 text-slate-400 md:h-8 md:w-8" />
            <p className="mt-2 text-xs text-slate-400 md:text-sm">No activity yet</p>
            <p className="text-[10px] text-slate-500 md:text-xs">
              Start exploring to see your activity here
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-2 rounded-xl bg-slate-800/50 p-3 transition hover:bg-slate-800 md:gap-3 md:p-4"
            >
              <div className="mt-0.5 rounded-full bg-slate-700 p-1 md:p-1.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-medium text-white md:text-sm">
                  {activity.title}
                </h3>
                <p className="text-[10px] text-slate-400 truncate md:text-sm">
                  {activity.description}
                </p>
              </div>
              <p className="flex-shrink-0 text-[10px] text-slate-500 md:text-xs">
                {formatDate(activity.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}