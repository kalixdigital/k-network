import { supabase } from '@/lib/supabase/client';
import { CompanySettings, MembershipLevel } from './types';

export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
}

export async function getMembershipLevels(): Promise<MembershipLevel[]> {
  try {
    const { data, error } = await supabase
      .from('membership_levels')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching membership levels:', error);
    return [];
  }
}

export async function getMembershipLevel(levelId: number): Promise<MembershipLevel | null> {
  try {
    const { data, error } = await supabase
      .from('membership_levels')
      .select('*')
      .eq('id', levelId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching membership level:', error);
    return null;
  }
}

export async function updateSettings(settings: Partial<CompanySettings>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('company_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
}