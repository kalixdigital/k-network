"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  Star, 
  Coins, 
  Users, 
  Crown,
  CheckCircle, 
  Clock,
  User,
  Shield
} from "lucide-react";
import StatsCard from "./StatsCard";
import LevelProgress from "./LevelProgress";
import QuickActions from "./QuickActions";
import ReferralCard from "./ReferralCard";
import RecentActivity from "./RecentActivity";
import GenealogyPreview from "./GenealogyPreview";
import RecentOrders from "./RecentOrders";
import MembershipBenefits from "./MembershipBenefits";
import PointsHistory from "./PointsHistory";
import EarningsChart from "./EarningsChart";
import { getLevel, getLevelName, getLevelColor } from "@/lib/constants/levels";

type Profile = {
  full_name: string;
  id_number: string;
  membership_level: number;
  monthly_points: number;
  lifetime_points: number;
  monthly_earnings: number;
  lifetime_earnings: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_active: boolean;
  is_verified: boolean;
};

// Level colors for the hero card - using the reusable level system
const getHeroCardGradient = (level: number): string => {
  const colors: Record<number, string> = {
    1: "from-emerald-600 via-emerald-500 to-emerald-400",
    2: "from-blue-600 via-blue-500 to-blue-400",
    3: "from-purple-600 via-purple-500 to-purple-400",
    4: "from-yellow-600 via-yellow-500 to-yellow-400",
    5: "from-orange-600 via-orange-500 to-orange-400",
    6: "from-cyan-500 via-cyan-400 to-cyan-300",
  };
  return colors[level] || colors[1];
};

export default function WelcomeCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("User fetch error:", userError);
          showToast.error("Failed to fetch user data");
          setLoading(false);
          return;
        }

        if (!user) {
          showToast.error("Please log in to continue");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            full_name,
            id_number,
            membership_level,
            monthly_points,
            lifetime_points,
            monthly_earnings,
            lifetime_earnings,
            direct_referrals,
            indirect_referrals,
            is_active,
            is_verified
          `
          )
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Profile fetch error:", error);
          showToast.error("Failed to load profile data");
          setLoading(false);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error("Unexpected error:", err);
        showToast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
          <p className="mt-4 text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-2 text-2xl font-bold text-white">Profile Not Found</h2>
        <p className="mb-4 text-slate-400">
          We couldn't find your profile. Please contact support.
        </p>
      </div>
    );
  }

  const levelId = profile.membership_level || 1;
  const levelName = getLevelName(levelId);
  const level = getLevel(levelId);
  const heroGradient = getHeroCardGradient(levelId);
  const isActive = profile.is_active && profile.is_verified;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Hero Card - Dynamic gradient based on level using reusable system */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r ${heroGradient} p-4 shadow-2xl md:p-8`}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
      
        <div className="relative">
          {/* Name and Level - Stacked on mobile, side by side on desktop */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-white/80">Welcome back 👋</p>
              <h1 className="mt-1 text-xl font-bold text-white md:text-3xl lg:text-4xl">
                {profile.full_name}
              </h1>
            </div>
            <div className={`flex items-center gap-2 rounded-full ${level.badgeBg} px-3 py-1.5 backdrop-blur-sm self-start`}>
              <Crown className={`h-4 w-4 ${level.textColor}`} />
              <span className={`text-xs font-semibold md:text-sm ${level.textColor}`}>
                {levelName}
              </span>
            </div>
          </div>
      
          {/* Member Info - Horizontal scroll on mobile, flex wrap on desktop */}
          <div className="mt-3 flex flex-wrap gap-3 md:mt-6 md:gap-6">
            <div className="min-w-[80px]">
              <p className="text-[10px] uppercase tracking-wider text-white/70 flex items-center gap-1">
                <User className="h-3 w-3" />
                Member ID
              </p>
              <p className="text-sm font-bold text-white md:text-xl truncate">
                {profile.id_number}
              </p>
            </div>
      
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/70 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Level
              </p>
              <p className={`text-sm font-bold md:text-xl ${level.textColor}`}>
                {levelName}
              </p>
            </div>
      
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/70 flex items-center gap-1">
                {isActive ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                Status
              </p>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "border border-green-500/50 bg-green-600/30 text-green-300"
                    : "border border-yellow-500/50 bg-yellow-500/30 text-yellow-300"
                }`}
              >
                {isActive ? "Active" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Monthly Points"
          value={profile.monthly_points.toLocaleString()}
          subtitle="This month"
          icon={<Star className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />}
          level={profile.membership_level}
        />
        <StatsCard
          title="Monthly Earnings"
          value={`₦${profile.monthly_earnings.toLocaleString()}`}
          subtitle="This month"
          icon={<Coins className="h-5 w-5 text-emerald-400 md:h-6 md:w-6" />}
          level={profile.membership_level}
        />
        <StatsCard
          title="Direct Referrals"
          value={profile.direct_referrals}
          subtitle="Total referrals"
          icon={<Users className="h-5 w-5 text-purple-400 md:h-6 md:w-6" />}
          level={profile.membership_level}
        />
        <StatsCard
          title="Membership Level"
          value={levelName}
          subtitle={`Level ${profile.membership_level}`}
          icon={<Crown className="h-5 w-5 text-amber-400 md:h-6 md:w-6" />}
          level={profile.membership_level}
        />
      </div>

      {/* Level Progress - Full width */}
      <LevelProgress
        level={profile.membership_level}
        currentPoints={profile.monthly_points}
      />

      {/* Quick Actions - Full width */}
      <QuickActions />

      {/* Two Column Layout: Referral Card + Recent Activity */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 lg:grid-cols-2">
        <ReferralCard memberId={profile.id_number} />
        <RecentActivity />
      </div>

      {/* Two Column Layout: Genealogy + Recent Orders */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 lg:grid-cols-2">
        <GenealogyPreview />
        <RecentOrders />
      </div>

      {/* Two Column Layout: Membership Benefits + Points History */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 lg:grid-cols-2">
        <MembershipBenefits />
        <PointsHistory />
      </div>

      {/* Earnings Chart - Full width */}
      <EarningsChart />
    </div>
  );
}