"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Users, ChevronRight, UserPlus, TreePine } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type ReferralNode = {
  id: string;
  full_name: string;
  id_number: string;
  level: number;
  children?: ReferralNode[];
};

type GenealogyStats = {
  direct: number;
  indirect: number;
  total: number;
};

export default function GenealogyPreview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GenealogyStats>({
    direct: 0,
    indirect: 0,
    total: 0,
  });
  const [recentReferrals, setRecentReferrals] = useState<ReferralNode[]>([]);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    loadGenealogyPreview();
  }, []);

  const loadGenealogyPreview = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get profile with referral counts and membership level
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("direct_referrals, indirect_referrals, membership_level")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setLoading(false);
        return;
      }

      if (profile) {
        setStats({
          direct: profile.direct_referrals || 0,
          indirect: profile.indirect_referrals || 0,
          total: (profile.direct_referrals || 0) + (profile.indirect_referrals || 0),
        });
        setUserLevel(profile.membership_level || 1);
      }

      // Get recent direct referrals (last 5)
      const { data: referrals, error: referralsError } = await supabase
        .from("profiles")
        .select("id, full_name, id_number, created_at, membership_level")
        .eq("referred_by", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (referralsError) {
        console.error("Referrals fetch error:", referralsError);
        setLoading(false);
        return;
      }

      if (referrals) {
        setRecentReferrals(
          referrals.map((r) => ({
            id: r.id,
            full_name: r.full_name,
            id_number: r.id_number,
            level: r.membership_level || 1,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading genealogy preview:", error);
    } finally {
      setLoading(false);
    }
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
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur h-full md:p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TreePine className={`h-4 w-4 md:h-5 md:w-5 ${levelColor}`} />
          <h2 className="text-base font-semibold text-white md:text-lg">Genealogy</h2>
        </div>
        <Link
          href="/dashboard/genealogy"
          className={`text-xs md:text-sm ${levelColor} hover:opacity-80 flex items-center gap-1`}
        >
          View Full Tree
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 md:mt-4 md:gap-3">
        <div className="rounded-xl bg-slate-800/50 p-2 text-center md:p-3">
          <p className={`text-lg font-bold md:text-2xl ${levelColor}`}>{stats.direct}</p>
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 md:text-xs">
            <UserPlus className="h-3 w-3" />
            Direct
          </p>
        </div>
        <div className="rounded-xl bg-slate-800/50 p-2 text-center md:p-3">
          <p className="text-lg font-bold text-purple-400 md:text-2xl">{stats.indirect}</p>
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 md:text-xs">
            <Users className="h-3 w-3" />
            Indirect
          </p>
        </div>
        <div className="rounded-xl bg-slate-800/50 p-2 text-center md:p-3">
          <p className="text-lg font-bold text-white md:text-2xl">{stats.total}</p>
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 md:text-xs">
            <TreePine className="h-3 w-3" />
            Total
          </p>
        </div>
      </div>

      {/* Recent Referrals */}
      {recentReferrals.length > 0 && (
        <div className="mt-3 md:mt-4">
          <p className="text-xs text-slate-400 mb-2 md:text-sm">Recent Referrals</p>
          <div className="space-y-1.5 md:space-y-2">
            {recentReferrals.map((ref) => {
              const refLevel = getLevel(ref.level);
              return (
                <div
                  key={ref.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800/30 px-2 py-1.5 md:px-3 md:py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full ${refLevel.badgeBg} text-xs font-bold ${refLevel.badgeText}`}>
                      {ref.full_name.charAt(0)}
                    </div>
                    <span className="text-xs text-white md:text-sm">{ref.full_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 md:text-xs">{ref.id_number}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentReferrals.length === 0 && (
        <div className="mt-3 rounded-xl bg-slate-800/30 p-3 text-center md:mt-4 md:p-4">
          <Users className="mx-auto h-6 w-6 text-slate-500 md:h-8 md:w-8" />
          <p className="mt-1 text-xs text-slate-400 md:mt-2 md:text-sm">No referrals yet</p>
          <p className="text-[10px] text-slate-500 md:text-xs">Share your referral link to start building your team</p>
        </div>
      )}
    </div>
  );
}