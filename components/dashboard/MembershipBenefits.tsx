"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Award, Check, Star, TrendingUp, Shield, Gift, Crown } from "lucide-react";
import { getLevel, getLevelName, getLevelColor } from "@/lib/constants/levels";

type MembershipLevel = {
  id: number;
  name: string;
  min_monthly_points: number;
  min_active_direct_referrals: number;
  benefits: string[];
  is_active: boolean;
};

// Legacy icons - kept for backward compatibility but using reusable system
const levelIcons: Record<number, React.ReactNode> = {
  1: <Star className="h-4 w-4 text-slate-400 md:h-5 md:w-5" />,
  2: <Award className="h-4 w-4 text-amber-400 md:h-5 md:w-5" />,
  3: <Crown className="h-4 w-4 text-slate-300 md:h-5 md:w-5" />,
  4: <Crown className="h-4 w-4 text-yellow-400 md:h-5 md:w-5" />,
  5: <Crown className="h-4 w-4 text-emerald-400 md:h-5 md:w-5" />,
  6: <Crown className="h-4 w-4 text-cyan-400 md:h-5 md:w-5" />,
};

export default function MembershipBenefits() {
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("membership_level")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserLevel(profile.membership_level || 1);
        }
      }

      const { data, error } = await supabase
        .from("membership_levels")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.error("Membership levels fetch error:", error);
        setLoading(false);
        return;
      }

      setLevels(data || []);
    } catch (error) {
      console.error("Error loading membership data:", error);
    } finally {
      setLoading(false);
    }
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

  const currentLevel = levels.find((l) => l.id === userLevel);
  const nextLevel = levels.find((l) => l.id === userLevel + 1);
  const currentLevelData = getLevel(userLevel);
  const currentLevelColor = currentLevelData.textColor;
  const currentLevelBg = currentLevelData.borderColor;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur h-full md:p-6">
      <div className="flex items-center gap-2">
        <Shield className={`h-4 w-4 md:h-5 md:w-5 ${currentLevelColor}`} />
        <h2 className="text-base font-semibold text-white md:text-lg">Membership Benefits</h2>
      </div>

      {currentLevel && (
        <div
          className={`mt-3 rounded-xl border ${currentLevelBg} p-3 md:p-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              {levelIcons[currentLevel.id]}
              <span className={`font-semibold text-sm md:text-base ${currentLevelColor}`}>
                {currentLevel.name}
              </span>
              <span className="text-[10px] text-slate-500 md:text-xs">(Current)</span>
            </div>
            <div className="text-[10px] text-slate-400 md:text-xs">
              {currentLevel.min_monthly_points} pts • {currentLevel.min_active_direct_referrals} referrals
            </div>
          </div>
          {currentLevel.benefits && currentLevel.benefits.length > 0 && (
            <div className="mt-2 space-y-1">
              {currentLevel.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-slate-300 md:text-sm">
                  <Check className={`h-3 w-3 ${currentLevelColor} mt-0.5 flex-shrink-0`} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {nextLevel && (
        <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-800/20 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-slate-400 md:h-4 md:w-4" />
              <span className="text-[10px] text-slate-400 md:text-xs">Next Level</span>
              <span className={`text-xs font-semibold md:text-sm ${getLevel(nextLevel.id).textColor}`}>
                {nextLevel.name}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 md:text-xs">
              {nextLevel.min_monthly_points} pts • {nextLevel.min_active_direct_referrals} referrals
            </div>
          </div>
          {nextLevel.benefits && nextLevel.benefits.length > 0 && (
            <div className="mt-2 space-y-1">
              {nextLevel.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-slate-500">
                  <Gift className={`h-3 w-3 ${getLevel(nextLevel.id).textColor} mt-0.5 flex-shrink-0`} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}