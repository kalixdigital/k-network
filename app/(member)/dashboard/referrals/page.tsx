"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import ReferralStats from "@/components/dashboard/referrals/ReferralStats";
import ReferralLink from "@/components/dashboard/referrals/ReferralLink";
import ReferralTable from "@/components/dashboard/referrals/ReferralTable";

type Referral = {
  id: string;
  full_name: string;
  id_number: string;
  email: string;
  membership_level: number;
  is_active: boolean;
  created_at: string;
  first_purchase_date: string | null;
};

type ReferralStats = {
  directReferrals: number;
  indirectReferrals: number;
  totalReferrals: number;
  activeReferrals: number;
  referralEarnings: number;
  referralPoints: number;
};

export default function ReferralsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [userLevel, setUserLevel] = useState(1);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    directReferrals: 0,
    indirectReferrals: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    referralEarnings: 0,
    referralPoints: 0,
  });

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
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

      // Get user profile with member ID and membership level
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, id_number, direct_referrals, indirect_referrals, points, total_earnings, membership_level")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      setMemberId(profile.id_number);
      setUserLevel(profile.membership_level || 1);

      // Use RPC function to get referrals - this handles the UUID to TEXT conversion properly
      const { data: directReferrals, error: referralsError } = await supabase
        .rpc('get_user_direct_referrals', { p_user_id: user.id });

      if (referralsError) {
        console.error("Referrals fetch error:", referralsError);
        setReferrals([]);
      } else {
        console.log("Found referrals:", directReferrals?.length || 0);
        setReferrals(directReferrals || []);
      }

      // Calculate stats - FIX: Add type annotation to 'r'
      const activeReferrals = (directReferrals || []).filter((r: Referral) => r.is_active).length;
      const totalReferrals = directReferrals?.length || 0;

      // Get referral earnings from points_history (direct_referral source)
      const { data: referralHistory, error: pointsError } = await supabase
        .from("points_history")
        .select("points")
        .eq("user_id", user.id)
        .eq("source", "direct_referral");

      if (pointsError) {
        console.error("Error loading points history:", pointsError);
      }

      const referralPoints = referralHistory?.reduce((sum, h) => sum + h.points, 0) || 0;

      // Get referral earnings from earnings_history
      const { data: earningsHistory, error: earningsError } = await supabase
        .from("earnings_history")
        .select("naira_equivalent")
        .eq("user_id", user.id)
        .eq("source", "direct_referral");

      if (earningsError) {
        console.error("Error loading earnings history:", earningsError);
      }

      const referralEarnings = earningsHistory?.reduce((sum, h) => sum + h.naira_equivalent, 0) || 0;

      setStats({
        directReferrals: profile.direct_referrals || 0,
        indirectReferrals: profile.indirect_referrals || 0,
        totalReferrals: totalReferrals,
        activeReferrals: activeReferrals,
        referralEarnings: referralEarnings,
        referralPoints: referralPoints,
      });

    } catch (error) {
      console.error("Error loading referrals:", error);
      showToast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`h-8 w-8 animate-spin rounded-full border-4 ${levelData.bgColor} border-t-transparent mx-auto`} />
          <p className="text-slate-400 mt-4">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">My Referrals</h1>
          <p className="text-sm text-slate-400">Manage and track your referral network</p>
        </div>
      </div>

      {/* Stats */}
      <ReferralStats
        directReferrals={stats.directReferrals}
        indirectReferrals={stats.indirectReferrals}
        totalReferrals={stats.totalReferrals}
        activeReferrals={stats.activeReferrals}
        referralEarnings={stats.referralEarnings}
        referralPoints={stats.referralPoints}
      />

      {/* Referral Link */}
      <ReferralLink memberId={memberId} />

      {/* Referral Table */}
      <ReferralTable referrals={referrals} loading={loading} />
    </div>
  );
}