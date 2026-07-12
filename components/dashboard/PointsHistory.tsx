"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { History, Star, Gift, ShoppingBag, Award, Clock } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type PointsEntry = {
  id: string;
  points: number;
  source: string;
  description: string;
  created_at: string;
};

const sourceIcons: Record<string, React.ReactNode> = {
  purchase: <ShoppingBag className="h-3 w-3 text-blue-400 md:h-4 md:w-4" />,
  direct_referral: <Gift className="h-3 w-3 text-purple-400 md:h-4 md:w-4" />,
  indirect_referral: <Award className="h-3 w-3 text-amber-400 md:h-4 md:w-4" />,
  registration: <Star className="h-3 w-3 text-emerald-400 md:h-4 md:w-4" />,
  manual_bonus: <Gift className="h-3 w-3 text-pink-400 md:h-4 md:w-4" />,
  adjustment: <Clock className="h-3 w-3 text-slate-400 md:h-4 md:w-4" />,
};

const sourceLabels: Record<string, string> = {
  purchase: "Purchase",
  direct_referral: "Direct Referral",
  indirect_referral: "Indirect Referral",
  registration: "Registration",
  manual_bonus: "Manual Bonus",
  adjustment: "Adjustment",
};

export default function PointsHistory() {
  const [history, setHistory] = useState<PointsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    loadPointsHistory();
  }, []);

  const loadPointsHistory = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's membership level for theming
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_level")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserLevel(profile.membership_level || 1);
      }

      const { data, error } = await supabase
        .from("points_history")
        .select("id, points, source, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Points history fetch error:", error);
        setLoading(false);
        return;
      }

      setHistory(data || []);
      
      const total = (data || []).reduce((sum, entry) => sum + entry.points, 0);
      setTotalPoints(total);
    } catch (error) {
      console.error("Error loading points history:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 h-full">
        <div className="flex items-center justify-center py-6 md:py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent md:h-8 md:w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur h-full md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className={`h-4 w-4 md:h-5 md:w-5 ${levelColor}`} />
          <h2 className="text-base font-semibold text-white md:text-lg">Points History</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 md:text-xs">Total Points</p>
          <p className={`text-sm font-bold md:text-lg ${levelColor}`}>+{totalPoints}</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="mt-3 rounded-xl bg-slate-800/30 p-4 text-center md:p-6">
          <Star className="mx-auto h-6 w-6 text-slate-500 md:h-8 md:w-8" />
          <p className="mt-2 text-xs text-slate-400 md:text-sm">No points history yet</p>
          <p className="text-[10px] text-slate-500 md:text-xs">Start earning points by making purchases</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-1">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg bg-slate-800/30 px-2 py-2 md:px-3 md:py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 md:gap-3">
                <div className="flex-shrink-0">
                  {sourceIcons[entry.source] || <Clock className="h-3 w-3 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate md:text-sm">
                    {entry.description}
                  </p>
                  <p className="text-[10px] text-slate-500 md:text-xs">
                    {sourceLabels[entry.source] || entry.source}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-2">
                <span className={`text-xs font-semibold md:text-sm ${levelColor}`}>
                  +{entry.points}
                </span>
                <span className="text-[10px] text-slate-500 md:text-xs">
                  {formatDate(entry.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}