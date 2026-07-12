"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  ArrowLeft, 
  Crown, 
  Star, 
  Award, 
  Trophy, 
  CheckCircle, 
  Lock,
  TrendingUp,
  Users,
  Coins,
  ShoppingBag,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getLevel, getLevelName, getLevelColor } from "@/lib/constants/levels";

type MembershipLevel = {
  id: number;
  name: string;
  min_monthly_points: number;
  min_active_direct_referrals: number;
  min_purchases_per_month: number;
  min_active_referrals_per_month: number;
  min_team_points: number;
  min_downline_level: number;
  min_downline_count: number;
  min_consecutive_months: number;
  benefits: string[];
  is_active: boolean;
};

type Profile = {
  id: string;
  full_name: string;
  membership_level: number;
  monthly_points: number;
  direct_referrals: number;
  is_active: boolean;
};

// Level icons mapping
const LEVEL_ICONS: Record<number, React.ReactNode> = {
  1: <Star className="h-6 w-6 text-slate-400" />,
  2: <Award className="h-6 w-6 text-amber-400" />,
  3: <Crown className="h-6 w-6 text-slate-300" />,
  4: <Crown className="h-6 w-6 text-yellow-400" />,
  5: <Crown className="h-6 w-6 text-emerald-400" />,
  6: <Crown className="h-6 w-6 text-cyan-400" />,
};

// Dark theme level backgrounds - using dark variants only
const getLevelCardBg = (levelId: number, isCurrent: boolean): string => {
  if (!isCurrent) return "bg-slate-900/50";
  
  switch (levelId) {
    case 1:
      return "bg-emerald-950/40 border-emerald-500/30";
    case 2:
      return "bg-blue-950/40 border-blue-500/30";
    case 3:
      return "bg-purple-950/40 border-purple-500/30";
    case 4:
      return "bg-yellow-950/40 border-yellow-500/30";
    case 5:
      return "bg-orange-950/40 border-orange-500/30";
    case 6:
      return "bg-cyan-950/40 border-cyan-500/30";
    default:
      return "bg-slate-900/50 border-slate-800";
  }
};

const getLevelProgressGradient = (levelId: number): string => {
  switch (levelId) {
    case 1:
      return "from-emerald-500 to-emerald-400";
    case 2:
      return "from-blue-500 to-blue-400";
    case 3:
      return "from-purple-500 to-purple-400";
    case 4:
      return "from-yellow-500 to-yellow-400";
    case 5:
      return "from-orange-500 to-orange-400";
    case 6:
      return "from-cyan-500 to-cyan-400";
    default:
      return "from-emerald-500 to-emerald-400";
  }
};

export default function LevelsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, membership_level, monthly_points, direct_referrals, is_active")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get membership levels
      const { data: levelsData, error: levelsError } = await supabase
        .from("membership_levels")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (levelsError) throw levelsError;
      setLevels(levelsData || []);

    } catch (error) {
      console.error("Error loading levels:", error);
      showToast.error("Failed to load levels");
    } finally {
      setLoading(false);
    }
  };

  const getLevelStatus = (levelId: number) => {
    if (!profile) return "locked";
    if (levelId === profile.membership_level) return "current";
    if (levelId < profile.membership_level) return "completed";
    return "locked";
  };

  const getProgressToNextLevel = () => {
    if (!profile) return 0;
    const currentLevelIndex = levels.findIndex(l => l.id === profile.membership_level);
    if (currentLevelIndex === -1 || currentLevelIndex === levels.length - 1) return 100;
    
    const nextLevel = levels[currentLevelIndex + 1];
    const currentLevel = levels[currentLevelIndex];
    
    const pointsNeeded = (nextLevel?.min_monthly_points || 0) - (currentLevel?.min_monthly_points || 0);
    const pointsEarned = (profile?.monthly_points || 0) - (currentLevel?.min_monthly_points || 0);
    
    return Math.min(Math.round((pointsEarned / pointsNeeded) * 100), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-slate-400 mt-4">Loading levels...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <p className="text-slate-400 mt-4">Profile not found</p>
      </div>
    );
  }

  const progress = getProgressToNextLevel();
  const currentLevelName = getLevelName(profile.membership_level);
  const currentLevelData = getLevel(profile.membership_level);
  const currentLevelColor = currentLevelData.textColor;
  const currentLevelBg = getLevelCardBg(profile.membership_level, true);
  const progressGradient = getLevelProgressGradient(profile.membership_level);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Membership Levels</h1>
          <p className="text-sm text-slate-400">Track your progress and unlock new benefits</p>
        </div>
      </div>

      {/* Current Level Status - Dark theme */}
      <div className={`rounded-2xl border ${currentLevelBg} p-6 shadow-xl backdrop-blur`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Current Level</p>
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${currentLevelColor}`}>
              {LEVEL_ICONS[profile.membership_level] || LEVEL_ICONS[1]}
              {currentLevelName}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Progress to Next Level</p>
            <p className={`text-xl font-bold ${currentLevelColor}`}>{progress}%</p>
          </div>
        </div>
        <div className="mt-3 relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={`mt-2 text-sm text-slate-400 flex items-center gap-1`}>
          <TrendingUp className="h-4 w-4" />
          {profile.monthly_points} monthly points • {profile.direct_referrals} referrals
        </p>
      </div>

      {/* Levels List */}
      <div className="space-y-4">
        {levels.map((level) => {
          const status = getLevelStatus(level.id);
          const isCurrent = status === "current";
          const isCompleted = status === "completed";
          const isLocked = status === "locked";
          const levelData = getLevel(level.id);
          const icon = LEVEL_ICONS[level.id] || LEVEL_ICONS[1];
          const levelBg = getLevelCardBg(level.id, isCurrent);

          return (
            <div
              key={level.id}
              className={`rounded-2xl border p-6 transition-all ${
                isCurrent
                  ? `${levelBg} shadow-lg shadow-${levelData.shadow}`
                  : isCompleted
                  ? 'border-emerald-500/20 bg-emerald-950/10 opacity-80'
                  : 'border-slate-800 bg-slate-900/50 opacity-60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-2 ${isCurrent ? `${levelData.badgeBg}` : 'bg-slate-800/30'}`}>
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                        Level {level.id}: {level.name}
                      </h3>
                      {isCurrent && (
                        <span className={`rounded-full ${levelData.badgeBg} px-2 py-0.5 text-xs font-medium ${levelData.badgeText}`}>
                          Current
                        </span>
                      )}
                      {isCompleted && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          ✅ Completed
                        </span>
                      )}
                      {isLocked && (
                        <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </span>
                      )}
                    </div>
                    {level.benefits && level.benefits.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {level.benefits.map((benefit, index) => (
                          <span key={index} className={`rounded-full ${levelData.badgeBg} px-2 py-0.5 text-xs ${levelData.badgeText}`}>
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Requirements</p>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-300">
                    <p>{level.min_monthly_points || 0} points</p>
                    <p>{level.min_active_direct_referrals || 0} referrals</p>
                    {level.min_purchases_per_month > 0 && (
                      <p>{level.min_purchases_per_month} purchases/month</p>
                    )}
                    {level.min_team_points > 0 && (
                      <p>{level.min_team_points} team points</p>
                    )}
                    {level.min_consecutive_months > 0 && (
                      <p>{level.min_consecutive_months} months consecutive</p>
                    )}
                  </div>
                </div>
              </div>

              {isCurrent && (
                <div className={`mt-4 pt-4 border-t ${levelData.borderColor}`}>
                  <p className={`text-sm ${levelData.textColor}`}>
                    {(() => {
                      const nextLevel = levels.find(l => l.id === level.id + 1);
                      if (nextLevel) {
                        const pointsNeeded = (nextLevel.min_monthly_points || 0) - (profile?.monthly_points || 0);
                        const levelName = getLevelName(level.id + 1);
                        if (pointsNeeded > 0) {
                          return `Earn ${pointsNeeded} more points to reach ${levelName}`;
                        } else {
                          return `You qualify for ${levelName}! Keep up the good work!`;
                        }
                      } else {
                        return "🎉 You've reached the highest level!";
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box - Dark theme */}
      <div className={`rounded-2xl border ${currentLevelData.borderColor} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
        <h3 className={`font-semibold flex items-center gap-2 mb-3 ${currentLevelColor}`}>
          <Trophy className={`h-5 w-5 ${currentLevelColor}`} />
          How to Level Up
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>• Earn <span className={currentLevelColor}>monthly points</span> through purchases and referrals</li>
          <li>• Build your <span className={currentLevelColor}>referral network</span> with active members</li>
          <li>• Maintain <span className={currentLevelColor}>consistent monthly activity</span> (purchases)</li>
          <li>• Help your downline grow to unlock <span className={currentLevelColor}>team bonuses</span></li>
          <li>• Higher levels unlock <span className={currentLevelColor}>better rewards and benefits</span></li>
        </ul>
      </div>
    </div>
  );
}