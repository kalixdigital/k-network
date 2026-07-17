// lib/services/promotionService.ts

import { supabase } from "@/lib/supabase/client";

type PromotionEligibleUser = {
  id: string;
  full_name: string;
  id_number: string;
  email: string;
  membership_level: number;
  monthly_points: number;
  direct_referrals: number;
  current_level_name: string;
  eligible_level: number;
  eligible_level_name: string;
  reason: string;
  referred_by: string | null;
  referrer_name?: string;  // ✅ string | undefined
  is_direct_referral?: boolean;
  is_indirect_referral?: boolean;
};

// Get level name helper
function getLevelName(levelId: number): string {
  const levelNames: Record<number, string> = {
    1: "Beginner",
    2: "Bronze",
    3: "Silver",
    4: "Gold",
    5: "Platinum",
    6: "Diamond",
  };
  return levelNames[levelId] || `Level ${levelId}`;
}

// Check if a user is eligible for promotion
function checkUserEligibility(
  user: any,
  levels: any[]
): Omit<PromotionEligibleUser, 'referred_by' | 'referrer_name' | 'is_direct_referral' | 'is_indirect_referral'> | null {
  const currentLevel = user.membership_level || 1;
  
  // Find the highest level the user qualifies for
  let eligibleLevel = null;
  let eligibleLevelName = null;

  for (const level of levels) {
    if (level.id <= currentLevel) continue;
    
    let qualifies = true;

    // Check all requirements
    if (level.min_monthly_points && (user.monthly_points || 0) < level.min_monthly_points) {
      qualifies = false;
    }
    if (level.min_active_direct_referrals && (user.direct_referrals || 0) < level.min_active_direct_referrals) {
      qualifies = false;
    }
    if (level.requires_first_purchase && !user.first_purchase_date) {
      qualifies = false;
    }
    if (level.requires_profile_complete && !user.registration_completed) {
      qualifies = false;
    }
    if (level.requires_active_status && !user.is_active) {
      qualifies = false;
    }

    if (qualifies) {
      eligibleLevel = level.id;
      eligibleLevelName = level.name;
      break; // Found the highest qualifying level
    }
  }

  if (eligibleLevel && eligibleLevel > currentLevel) {
    const reason = `Qualifies for ${eligibleLevelName} (Level ${eligibleLevel})`;
    return {
      id: user.id,
      full_name: user.full_name,
      id_number: user.id_number,
      email: user.email,
      membership_level: currentLevel,
      monthly_points: user.monthly_points || 0,
      direct_referrals: user.direct_referrals || 0,
      current_level_name: getLevelName(currentLevel),
      eligible_level: eligibleLevel,
      eligible_level_name: eligibleLevelName,
      reason: reason,
    };
  }

  return null;
}

export async function checkPromotionEligibility(userId: string): Promise<PromotionEligibleUser[]> {
  try {
    console.log("🔍 Checking promotion eligibility for user:", userId);

    // Get all active membership levels
    const { data: levels, error: levelsError } = await supabase
      .from("membership_levels")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (levelsError) {
      console.error("❌ Error fetching membership levels:", {
        message: levelsError.message,
        details: levelsError.details,
        hint: levelsError.hint,
        code: levelsError.code,
      });
      return [];
    }

    if (!levels || levels.length === 0) {
      console.log("ℹ️ No active membership levels found");
      return [];
    }

    console.log(`📊 Found ${levels.length} active membership levels`);

    // Get the user
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("❌ Error fetching user:", {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code,
      });
      return [];
    }

    if (!userData) {
      console.log("ℹ️ User not found");
      return [];
    }

    console.log("👤 User data:", {
      id: userData.id,
      full_name: userData.full_name,
      membership_level: userData.membership_level,
      monthly_points: userData.monthly_points,
      direct_referrals: userData.direct_referrals,
      referred_by: userData.referred_by,
    });

    // Get user's referrer name if exists
    let referrerName: string | undefined = undefined;
    if (userData.referred_by) {
      const { data: referrer, error: referrerError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userData.referred_by)
        .single();

      if (!referrerError && referrer) {
        referrerName = referrer.full_name;
      }
    }

    const eligibleUsers: PromotionEligibleUser[] = [];

    // 1. Check the user themselves
    const userEligibility = checkUserEligibility(userData, levels);
    if (userEligibility) {
      eligibleUsers.push({
        ...userEligibility,
        referred_by: userData.referred_by,
        referrer_name: referrerName,
        is_direct_referral: false,
        is_indirect_referral: false,
      });
    }

    // 2. Check direct referrer if exists
    if (userData.referred_by) {
      const { data: directReferrer, error: directError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.referred_by)
        .single();

      if (!directError && directReferrer) {
        const directEligibility = checkUserEligibility(directReferrer, levels);
        if (directEligibility) {
          eligibleUsers.push({
            ...directEligibility,
            referred_by: directReferrer.referred_by,
            referrer_name: undefined,  // ✅ Use undefined instead of null
            is_direct_referral: true,
            is_indirect_referral: false,
          });
        }

        // 3. Check indirect referrer (referrer of the direct referrer)
        if (directReferrer.referred_by) {
          const { data: indirectReferrer, error: indirectError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", directReferrer.referred_by)
            .single();

          if (!indirectError && indirectReferrer) {
            const indirectEligibility = checkUserEligibility(indirectReferrer, levels);
            if (indirectEligibility) {
              eligibleUsers.push({
                ...indirectEligibility,
                referred_by: indirectReferrer.referred_by,
                referrer_name: undefined,  // ✅ Use undefined instead of null
                is_direct_referral: false,
                is_indirect_referral: true,
              });
            }
          }
        }
      }
    }

    console.log(`✅ Found ${eligibleUsers.length} eligible users for promotion`);
    return eligibleUsers;
  } catch (error: any) {
    console.error("❌ Error checking promotion eligibility:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      stack: error?.stack,
    });
    return [];
  }
}

export async function promoteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🚀 Promoting user:", userId);

    const { data, error } = await supabase
      .rpc('promote_single_user', { p_user_id: userId });

    if (error) {
      console.error("❌ Error promoting user:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return { success: false, error: error.message };
    }

    console.log("✅ Promotion result:", data);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Unexpected error promoting user:", {
      message: error?.message,
      stack: error?.stack,
    });
    return { success: false, error: error?.message || "Unknown error" };
  }
}