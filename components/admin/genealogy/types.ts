// components/admin/genealogy/types.ts
export type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  id_number: string;
  membership_level: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_verified: boolean;
  is_active: boolean;
  referred_by: string | null;
  created_at: string;
  country: string | null;
  state: string | null;
  points: number;
  total_earnings: number;
};

export type TreeNode = {
  member: Member;
  children: TreeNode[];
  level: number;
};

export type GenealogyStats = {
  total: number;
  verified: number;
  pending: number;
  active: number;
  rootMembers: number;
};