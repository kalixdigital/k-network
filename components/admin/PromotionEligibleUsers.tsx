// components/admin/PromotionEligibleUsers.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/toast';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Eye, 
  GitBranch,
  ChevronRight,
  CheckCircle,
  Loader2,
  Crown,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

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
  referrer_name?: string;
  is_direct_referral?: boolean;
  is_indirect_referral?: boolean;
};

type PromotionEligibleUsersProps = {
  userId: string;
  orderId?: string;
  onPromotionComplete?: () => void;
};

export default function PromotionEligibleUsers({ 
  userId, 
  orderId, 
  onPromotionComplete 
}: PromotionEligibleUsersProps) {
  const [eligibleUsers, setEligibleUsers] = useState<PromotionEligibleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEligibleUsers();
  }, [userId]);

  const fetchEligibleUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Dynamically import the service
      const { checkPromotionEligibility } = await import('@/lib/services/promotionService');
      const users = await checkPromotionEligibility(userId);
      setEligibleUsers(users);
    } catch (error: any) {
      console.error('Error fetching eligible users:', error);
      setError(error?.message || 'Failed to load eligible users');
      showToast.error('Failed to check promotion eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: string) => {
    setPromoting(userId);
    try {
      const { promoteUser } = await import('@/lib/services/promotionService');
      const result = await promoteUser(userId);
      
      if (result.success) {
        setPromotedIds(prev => new Set(prev).add(userId));
        showToast.success('User promoted successfully!');
        
        // Refresh the list after promotion
        await fetchEligibleUsers();
        if (onPromotionComplete) onPromotionComplete();
      } else {
        showToast.error(result.error || 'Failed to promote user');
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to promote user');
    } finally {
      setPromoting(null);
    }
  };

  const getRelationshipLabel = (user: PromotionEligibleUser) => {
    if (user.is_direct_referral) {
      return 'Direct Referral';
    }
    if (user.is_indirect_referral) {
      return 'Indirect Referral';
    }
    return 'Self';
  };

  const getRelationshipColor = (user: PromotionEligibleUser) => {
    if (user.is_direct_referral) {
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
    if (user.is_indirect_referral) {
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-4 sm:p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span className="ml-2 text-sm text-slate-400">Checking eligible users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-400">Error Checking Eligibility</p>
            <p className="text-xs text-red-300/70">{error}</p>
            <button
              onClick={fetchEligibleUsers}
              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (eligibleUsers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-amber-500/20 p-2">
          <Crown className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Eligible for Promotion</h3>
          <p className="text-sm text-slate-400">
            The following users have met the requirements for promotion
          </p>
        </div>
        <span className="ml-auto rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
          {eligibleUsers.length} eligible
        </span>
      </div>

      <div className="space-y-3">
        {eligibleUsers.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 transition hover:bg-slate-800/50"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white">{user.full_name}</p>
                  <span className="text-xs text-slate-400">#{user.id_number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getRelationshipColor(user)}`}>
                    {getRelationshipLabel(user)}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    Level {user.membership_level} → {user.eligible_level_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {user.monthly_points} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {user.direct_referrals} referrals
                  </span>
                </div>
                
                <p className="text-xs text-amber-400 mt-1">{user.reason}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Promote Button */}
                {!promotedIds.has(user.id) && (
                  <button
                    onClick={() => handlePromote(user.id)}
                    disabled={promoting === user.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {promoting === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Promote
                  </button>
                )}
                
                {promotedIds.has(user.id) && (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    Promoted!
                  </span>
                )}

                {/* View Profile */}
                <Link
                  href={`/admin/members/${user.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  <Eye className="h-4 w-4" />
                  Profile
                </Link>

                {/* View Genealogy */}
                <Link
                  href={`/admin/genealogy?userId=${user.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  <GitBranch className="h-4 w-4" />
                  Tree
                </Link>
              </div>
            </div>

            {/* Show referrer info if available */}
            {user.referrer_name && (
              <div className="mt-2 text-xs text-slate-500">
                Referred by: {user.referrer_name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action to view all promotions */}
      <div className="mt-4 text-center">
        <Link
          href="/admin/promotions"
          className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition"
        >
          View all promotions
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}