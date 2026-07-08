import { supabase } from '@/lib/supabase/client';
import { Profile, MembershipLevel, MembershipEvaluationResult } from './types';
import { getMembershipLevels, getMembershipLevel } from './settings';
import { getActiveDirectReferrals } from './referrals';

export async function evaluateMembership(
  userId: string,
  month: number,
  year: number
): Promise<MembershipEvaluationResult> {
  try {
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get membership levels
    const levels = await getMembershipLevels();
    if (levels.length === 0) {
      return {
        userId,
        currentLevel: user.membership_level || 1,
        newLevel: user.membership_level || 1,
        wasUpgraded: false,
        monthlyPoints: user.monthly_points || 0,
        activeDirectReferrals: 0
      };
    }

    // Get monthly statistics
    const { data: monthlyStats, error: statsError } = await supabase
      .from('monthly_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (statsError) throw statsError;

    const monthlyPoints = monthlyStats?.monthly_points || user.monthly_points || 0;
    const activeDirectReferrals = monthlyStats?.active_direct_referrals || 0;

    // Find the highest level the user qualifies for
    let newLevel = 1;
    for (const level of levels) {
      // Use the correct field names from the table
      const minPoints = level.min_monthly_points || 0;
      const minReferrals = level.min_active_direct_referrals || 0;
      
      if (monthlyPoints >= minPoints && activeDirectReferrals >= minReferrals) {
        newLevel = level.id;
      }
    }

    const currentLevel = user.membership_level || 1;
    const wasUpgraded = newLevel > currentLevel;

    // If upgraded, update user's membership level
    if (wasUpgraded) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          membership_level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    // Update monthly statistics with qualified level
    if (monthlyStats) {
      await supabase
        .from('monthly_statistics')
        .update({
          qualified_level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year);
    }

    return {
      userId,
      currentLevel,
      newLevel,
      wasUpgraded,
      monthlyPoints,
      activeDirectReferrals
    };
  } catch (error) {
    console.error('Error evaluating membership:', error);
    return {
      userId,
      currentLevel: 1,
      newLevel: 1,
      wasUpgraded: false,
      monthlyPoints: 0,
      activeDirectReferrals: 0
    };
  }
}