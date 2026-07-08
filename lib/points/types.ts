// ============================================
// POINTS ENGINE TYPES
// ============================================

export interface CompanySettings {
  id: number;
  direct_referral_bonus: number;
  indirect_referral_bonus: number;
  max_direct_referrals: number;
  monthly_reset_day: number;
  points_rate: number;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
}

export interface MembershipLevel {
  id: number;
  name: string;
  min_monthly_points: number;
  min_active_direct_referrals: number;
  benefits: string[];
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  points: number;
  stock: number;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  total_points: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  points_earned: number;
  product?: Product;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  id_number: string;
  referred_by: string | null;
  membership_level: number;
  monthly_points: number;
  lifetime_points: number;
  monthly_earnings: number;
  lifetime_earnings: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_verified: boolean;
  role: 'user' | 'admin';
}

export interface MonthlyStatistics {
  user_id: string;
  month: number;
  year: number;
  monthly_points: number;
  monthly_earnings: number;
  active_direct_referrals: number;
  qualified_level: number;
}

export interface PointsHistory {
  user_id: string;
  points: number;
  source: 'purchase' | 'direct_referral' | 'indirect_referral' | 'manual_bonus' | 'adjustment';
  source_id?: string;
  description?: string;
  reference_id?: string;
  created_at?: string;
}

export interface EarningsHistory {
  user_id: string;
  points: number;
  naira_equivalent: number;
  source: 'purchase' | 'direct_referral' | 'indirect_referral' | 'manual_bonus' | 'adjustment';
  source_id?: string;
  description?: string;
  created_at?: string;
}

export interface CommissionResult {
  userId: string;
  pointsAwarded: number;
  source: 'direct_referral' | 'indirect_referral';
  description: string;
}

export interface PointsCalculationResult {
  buyerId: string;
  productPoints: number;
  directReferralPoints: number;
  indirectReferralPoints: number;
  totalPoints: number;
  totalEarnings: number;
  directReferralCommission: CommissionResult | null;
  indirectReferralCommission: CommissionResult | null;
}

export interface MembershipEvaluationResult {
  userId: string;
  currentLevel: number;
  newLevel: number;
  wasUpgraded: boolean;
  monthlyPoints: number;
  activeDirectReferrals: number;
}