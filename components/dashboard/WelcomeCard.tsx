"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
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

  useEffect(() => {
  const loadProfile = async () => {
    // Get the logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get the user's profile
    const { data, error } = await supabase
      .from("profiles")
      .select(`
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
      `)
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProfile(data);
  };

  loadProfile();
}, []);

  if (!profile) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
        Loading...
      </div>
    );
}
return (
  <>
    {/* Hero Card */}
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-8 shadow-2xl">

      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">

        <p className="text-white/80">
          Welcome back 👋
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          {profile.full_name}
        </h1>

        <div className="mt-6 flex flex-wrap gap-4">

          <div>
            <p className="text-xs uppercase tracking-wider text-white/70">
              Member ID
            </p>

            <h3 className="text-xl font-bold text-white">
              {profile.id_number}
            </h3>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/70">
              Membership Level
            </p>

            <h3 className="text-xl font-bold text-white">
              Level {profile.membership_level}
            </h3>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/70">
              Status
            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                profile.is_verified
                  ? "bg-green-600 text-white"
                  : "bg-yellow-500 text-black"
              }`}
            >
              {profile.is_verified ? "Verified" : "Pending"}
            </span>
          </div>

        </div>

      </div>

    </div>

    {/* Stats */}
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

      <StatsCard
        title="⭐ Monthly Points"
        value={profile.monthly_points}
      />

      <StatsCard
        title="💰 Monthly Earnings"
        value={`₦${profile.monthly_earnings}`}
      />

      <StatsCard
        title="👥 Direct Referrals"
        value={profile.direct_referrals}
      />

      <StatsCard
        title="🏆 Lifetime Points"
        value={profile.lifetime_points}
      />

    </div>

    {/* Level Progress */}
    <div className="mt-8">
      <LevelProgress
        level={profile.membership_level}
        currentPoints={profile.monthly_points}
      />
    </div>

    <QuickActions />

    <ReferralCard
  memberId={profile.id_number}
/>

<RecentActivity />

  </>
);
}
