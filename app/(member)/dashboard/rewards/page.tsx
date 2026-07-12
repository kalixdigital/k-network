"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import RewardsStats from "@/components/dashboard/rewards/RewardsStats";
import RewardCards from "@/components/dashboard/rewards/RewardCards";
import RewardsSummary from "@/components/dashboard/rewards/RewardsSummary";
import RewardsHistory from "@/components/dashboard/rewards/RewardsHistory";
import { 
  ShoppingBag,
  Users,
  Award,
  Gift,
  Coins,
  TrendingUp,
  Star,
  Zap,
  Crown,
  ChevronRight
} from "lucide-react";

type RewardEntry = {
  id: string;
  points: number;
  naira_equivalent: number;
  source: string;
  description: string;
  created_at: string;
};

export default function RewardsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<RewardEntry[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [stats, setStats] = useState({
    totalPoints: 0,
    monthlyPoints: 0,
    lifetimePoints: 0,
    totalEarnings: 0,
    referralBonus: 0,
    levelBonus: 0,
    purchasePoints: 0,
    referralPoints: 0,
    levelBonusPoints: 0,
    nextLevelPoints: 0,
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
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

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profile);
      setUserLevel(profile.membership_level || 1);

      // Get points history
      const { data: pointsHistory, error: historyError } = await supabase
        .from("points_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (historyError) {
        console.error("Points history fetch error:", historyError);
        // Continue with empty history
      }

      // Also get earnings history for naira values
      const { data: earningsHistory, error: earningsError } = await supabase
        .from("earnings_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (earningsError) {
        console.error("Earnings history fetch error:", earningsError);
        // Continue with empty earnings
      }

      // Combine points and earnings history
      const combinedHistory: RewardEntry[] = (pointsHistory || []).map((ph: any) => {
        const earning = earningsHistory?.find((eh: any) => eh.points === ph.points && eh.source === ph.source);
        return {
          id: ph.id,
          points: ph.points,
          naira_equivalent: earning?.naira_equivalent || ph.points * 10, // fallback
          source: ph.source,
          description: ph.description || ph.source,
          created_at: ph.created_at,
        };
      });

      setHistory(combinedHistory);

      // Calculate stats
      const referralBonus = (pointsHistory || [])
        .filter((p: any) => p.source === "direct_referral" || p.source === "indirect_referral")
        .reduce((sum: number, p: any) => sum + p.points, 0);

      const levelBonus = (pointsHistory || [])
        .filter((p: any) => p.source === "level_bonus" || p.source === "membership")
        .reduce((sum: number, p: any) => sum + p.points, 0);

      const purchasePoints = (pointsHistory || [])
        .filter((p: any) => p.source === "purchase")
        .reduce((sum: number, p: any) => sum + p.points, 0);

      const referralPoints = (pointsHistory || [])
        .filter((p: any) => p.source === "direct_referral" || p.source === "indirect_referral")
        .reduce((sum: number, p: any) => sum + p.points, 0);

      // Calculate next level points - get from membership_levels table
      const { data: levelsData, error: levelsError } = await supabase
        .from("membership_levels")
        .select("id, min_monthly_points")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (levelsError) {
        console.error("Levels fetch error:", levelsError);
      }

      let nextLevelPoints = 500; // fallback
      if (levelsData && levelsData.length > 0) {
        const currentLevelIndex = levelsData.findIndex((l: any) => l.id === profile.membership_level);
        if (currentLevelIndex !== -1 && currentLevelIndex < levelsData.length - 1) {
          nextLevelPoints = levelsData[currentLevelIndex + 1].min_monthly_points || 500;
        }
      }

      setStats({
        totalPoints: profile.points || 0,
        monthlyPoints: profile.monthly_points || 0,
        lifetimePoints: profile.lifetime_points || 0,
        totalEarnings: profile.total_earnings || 0,
        referralBonus: referralBonus || 0,
        levelBonus: levelBonus || 0,
        purchasePoints: purchasePoints || 0,
        referralPoints: referralPoints || 0,
        levelBonusPoints: levelBonus || 0,
        nextLevelPoints: nextLevelPoints,
      });

    } catch (error) {
      console.error("Error loading rewards:", error);
      showToast.error("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Rewards</h1>
          <p className="text-sm text-slate-400">Track your earnings and rewards</p>
        </div>
      </div>

      {/* Stats - Pass userLevel */}
      <RewardsStats
        totalPoints={stats.totalPoints}
        monthlyPoints={stats.monthlyPoints}
        lifetimePoints={stats.lifetimePoints}
        totalEarnings={stats.totalEarnings}
        referralBonus={stats.referralBonus}
        levelBonus={stats.levelBonus}
        userLevel={userLevel}
      />

      {/* Quick Action Cards */}
      <RewardCards />

      {/* Rewards Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <RewardsSummary
          totalPoints={stats.totalPoints}
          referralPoints={stats.referralPoints}
          purchasePoints={stats.purchasePoints}
          levelBonusPoints={stats.levelBonusPoints}
          monthlyPoints={stats.monthlyPoints}
          nextLevelPoints={stats.nextLevelPoints}
          userLevel={userLevel}
        />

        {/* Additional Info Card */}
        <div className={`rounded-2xl border ${levelData.borderColor} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
          <h3 className={`font-semibold mb-4 ${levelColor}`}>How to Earn More</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={`rounded-lg ${levelData.badgeBg} p-1.5`}>
                <ShoppingBag className={`h-4 w-4 ${levelData.badgeText}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Make Purchases</p>
                <p className="text-xs text-slate-400">Earn points on every product you buy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/10 p-1.5">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Refer Friends</p>
                <p className="text-xs text-slate-400">Earn bonus points for every successful referral</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-1.5">
                <Award className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Level Up</p>
                <p className="text-xs text-slate-400">Unlock bonus rewards as you reach new levels</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History - Pass userLevel */}
      <RewardsHistory history={history} loading={loading} userLevel={userLevel} />
    </div>
  );
}