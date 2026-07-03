"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import StatsCard from "./StatsCard";
import LevelProgress from "./LevelProgress";
import QuickActions from "./QuickActions";
import ReferralCard from "./ReferralCard";
import RecentActivity from "./RecentActivity";

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
  is_verified: boolean;
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
            is_verified
          `
          )
          .eq("id", user.id)
          .single();

        if (error) {
          //console.error("Profile fetch error:", error);
          console.error("Supabase response:", {
            data,
            error,
          });
          
          console.error("Error code:", error?.code);
          console.error("Error message:", error?.message);
          console.error("Error details:", error?.details);
          console.error("Error hint:", error?.hint);
          
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

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 shadow-2xl md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <p className="text-sm text-white/80 md:text-lg">Welcome back 👋</p>
          <h1 className="mt-2 text-2xl font-bold text-white md:text-4xl">
            {profile.full_name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-3 md:mt-6 md:gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">
                Member ID
              </p>
              <p className="text-lg font-bold text-white md:text-xl">
                {profile.id_number}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">
                Membership Level
              </p>
              <p className="text-lg font-bold text-white md:text-xl">
                Level {profile.membership_level}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">
                Status
              </p>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  profile.is_verified
                    ? "border border-green-500/50 bg-green-600/30 text-green-300"
                    : "border border-yellow-500/50 bg-yellow-500/30 text-yellow-300"
                }`}
              >
                {profile.is_verified ? "✅ Verified" : "⏳ Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Monthly Points"
          value={profile.monthly_points}
          icon="⭐"
          subtitle="This month"
        />
        <StatsCard
          title="Monthly Earnings"
          value={`₦${profile.monthly_earnings.toLocaleString()}`}
          icon="💰"
          subtitle="This month"
        />
        <StatsCard
          title="Direct Referrals"
          value={profile.direct_referrals}
          icon="👥"
          subtitle="Total referrals"
        />
        <StatsCard
          title="Lifetime Points"
          value={profile.lifetime_points}
          icon="🏆"
          subtitle="All time"
        />
      </div> 

      {/* Level Progress */}
      <LevelProgress
        level={profile.membership_level}
        currentPoints={profile.monthly_points}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Referral Card */}
      <ReferralCard 
        memberId={profile.id_number} 
      />
 
      {/* Recent Activity */}
      <RecentActivity /> 
    
  </div>
  );
}