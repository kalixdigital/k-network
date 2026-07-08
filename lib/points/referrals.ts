import { supabase } from '@/lib/supabase/client';
import { Profile } from './types';

export async function getSponsor(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    return null;
  }
}

export async function getDirectReferrals(userId: string): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('referred_by', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching direct referrals:', error);
    return [];
  }
}

export async function getActiveDirectReferrals(userId: string, month: number, year: number): Promise<number> {
  try {
    // Get all direct referrals
    const referrals = await getDirectReferrals(userId);
    
    if (referrals.length === 0) return 0;

    // Get referral IDs
    const referralIds = referrals.map(r => r.id);
    
    // Count how many have monthly_points > 0 for the given month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { count, error } = await supabase
      .from('monthly_statistics')
      .select('*', { count: 'exact', head: true })
      .in('user_id', referralIds)
      .eq('month', month)
      .eq('year', year)
      .gt('monthly_points', 0);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting active direct referrals:', error);
    return 0;
  }
}

export async function getDirectReferralCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting direct referrals:', error);
    return 0;
  }
}

export async function getReferralChain(userId: string): Promise<{ direct: Profile | null; indirect: Profile | null }> {
  try {
    // Get the user
    const user = await getSponsor(userId);
    if (!user) return { direct: null, indirect: null };

    let direct: Profile | null = null;
    let indirect: Profile | null = null;

    // Get direct sponsor
    if (user.referred_by) {
      direct = await getSponsor(user.referred_by);
      
      // Get indirect sponsor (sponsor of the direct sponsor)
      if (direct && direct.referred_by) {
        indirect = await getSponsor(direct.referred_by);
      }
    }

    return { direct, indirect };
  } catch (error) {
    console.error('Error getting referral chain:', error);
    return { direct: null, indirect: null };
  }
}

export async function canAddReferral(sponsorId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get company settings
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('max_direct_referrals')
      .eq('id', 1)
      .single();

    if (error) throw error;

    const currentCount = await getDirectReferralCount(sponsorId);
    const maxReferrals = settings?.max_direct_referrals || 20;

    if (currentCount >= maxReferrals) {
      return { 
        allowed: false, 
        reason: `Maximum direct referrals (${maxReferrals}) reached` 
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking referral limit:', error);
    return { allowed: false, reason: 'Error checking referral limit' };
  }
}