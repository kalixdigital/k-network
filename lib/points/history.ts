import { supabase } from '@/lib/supabase/client';
import { PointsHistory, EarningsHistory } from './types';

export async function recordPointsHistory(entry: PointsHistory): Promise<void> {
  try {
    const { error } = await supabase
      .from('points_history')
      .insert({
        user_id: entry.user_id,
        points: entry.points,
        source: entry.source,
        source_id: entry.source_id,
        description: entry.description,
        reference_id: entry.reference_id,
        created_at: entry.created_at || new Date().toISOString()
      });

    if (error) {
      console.error('Supabase points history error:', error);
      throw new Error(`Failed to record points history: ${error.message}`);
    }
  } catch (error) {
    console.error('Error recording points history:', error);
    throw error;
  }
}

export async function recordEarningsHistory(entry: EarningsHistory): Promise<void> {
  try {
    const { error } = await supabase
      .from('earnings_history')
      .insert({
        user_id: entry.user_id,
        points: entry.points,
        naira_equivalent: entry.naira_equivalent,
        source: entry.source,
        source_id: entry.source_id,
        description: entry.description,
        created_at: entry.created_at || new Date().toISOString()
      });

    if (error) {
      console.error('Supabase earnings history error:', error);
      throw new Error(`Failed to record earnings history: ${error.message}`);
    }
  } catch (error) {
    console.error('Error recording earnings history:', error);
    throw error;
  }
}

export async function updateMonthlyStatistics(
  userId: string,
  month: number,
  year: number,
  updates: {
    monthly_points?: number;
    monthly_earnings?: number;
    active_direct_referrals?: number;
    qualified_level?: number;
  }
): Promise<void> {
  try {
    // Get existing record
    const { data: existing, error: checkError } = await supabase
      .from('monthly_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking monthly statistics:', checkError);
      throw new Error(`Failed to check monthly statistics: ${checkError.message}`);
    }

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('monthly_statistics')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Failed to update monthly statistics: ${error.message}`);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('monthly_statistics')
        .insert({
          user_id: userId,
          month,
          year,
          monthly_points: updates.monthly_points || 0,
          monthly_earnings: updates.monthly_earnings || 0,
          active_direct_referrals: updates.active_direct_referrals || 0,
          qualified_level: updates.qualified_level || 1
        });

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to insert monthly statistics: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error updating monthly statistics:', error);
    throw error;
  }
}