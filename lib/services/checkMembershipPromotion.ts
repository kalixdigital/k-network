// Add this helper function to check and promote
// /lib/services/checkMembershipPromotion.ts

import { supabase } from "@/lib/supabase/client";

export async function checkAndPromoteMembership(userId: string) {
  try {
    // Get user's current stats
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("membership_level, monthly_points, direct_referrals")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Get membership levels
    const { data: levels, error: levelsError } = await supabase
      .from("membership_levels")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: false });

    if (levelsError) throw levelsError;

    // Find the highest level they qualify for
    let newLevel = 1;
    for (const level of levels) {
      if (
        profile.monthly_points >= level.min_monthly_points &&
        profile.direct_referrals >= level.min_active_direct_referrals
      ) {
        newLevel = level.id;
        break;
      }
    }

    // If new level is higher, update
    if (newLevel > profile.membership_level) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          membership_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Create activity log
      await supabase.from("activities").insert({
        user_id: userId,
        title: "🎉 Membership Upgraded!",
        description: `Congratulations! You've been promoted to Level ${newLevel}! Keep up the great work!`,
        type: "membership",
        created_at: new Date().toISOString(),
      });

      return { promoted: true, newLevel };
    }

    return { promoted: false, currentLevel: profile.membership_level };
  } catch (error) {
    console.error("Error checking membership promotion:", error);
    return { promoted: false, error };
  }
}