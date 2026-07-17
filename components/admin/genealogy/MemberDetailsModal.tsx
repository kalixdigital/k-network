// components/admin/genealogy/MemberDetailsModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/toast';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Coins, 
  Users,
  CheckCircle,
  XCircle,
  Crown,
  TrendingUp,
  GitBranch,
  ExternalLink
} from 'lucide-react';
import { getLevel, getLevelName } from '@/lib/constants/levels';

interface MemberDetailsModalProps {
  memberId: string;
  isOpen: boolean;
  onClose: () => void;
}

type MemberDetail = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  id_number: string;
  membership_level: number;
  points: number;
  total_earnings: number;
  monthly_points: number;
  lifetime_points: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_verified: boolean;
  is_active: boolean;
  registration_completed: boolean;
  created_at: string;
  first_purchase_date: string | null;
  activation_date: string | null;
  country: string | null;
  state: string | null;
  address: string | null;
  referred_by: string | null;
  referrer_name?: string;
};

export default function MemberDetailsModal({ memberId, isOpen, onClose }: MemberDetailsModalProps) {
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && memberId) {
      loadMemberDetails();
    }
  }, [isOpen, memberId]);

  const loadMemberDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;

      // Get referrer name if exists
      let referrerName = null;
      if (data.referred_by) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.referred_by)
          .single();
        if (referrer) {
          referrerName = referrer.full_name;
        }
      }

      setMember({ ...data, referrer_name: referrerName });
    } catch (error) {
      console.error('Error loading member details:', error);
      showToast.error('Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullProfile = () => {
    onClose();
    router.push(`/admin/members/${memberId}`);
  };

  const handleViewGenealogy = () => {
    onClose();
    router.push(`/admin/genealogy?userId=${memberId}`);
  };

  if (!isOpen) return null;

  const levelData = getLevel(member?.membership_level || 1);
  const levelName = getLevelName(member?.membership_level || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : member ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full ${levelData.bgColor} bg-opacity-20 text-2xl sm:text-3xl font-bold ${levelData.textColor} flex-shrink-0`}>
                {member.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {member.full_name}
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${levelData.textColor} ${levelData.badgeBg}`}>
                    {levelData.name}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{member.id_number}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs flex items-center gap-1 ${member.is_verified ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {member.is_verified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {member.is_verified ? 'Verified' : 'Pending'}
                  </span>
                  <span className={`text-xs flex items-center gap-1 ${member.is_active ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {member.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-white flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-500" />
                      {member.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-white flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-500" />
                      {member.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm text-white flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {member.country || 'N/A'}
                      {member.state && `, ${member.state}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Joined</p>
                    <p className="text-sm text-white flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Statistics
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Points</span>
                    <span className="text-sm font-medium text-yellow-400">{member.points.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Total Earnings</span>
                    <span className="text-sm font-medium text-emerald-400">₦{member.total_earnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Direct Referrals</span>
                    <span className="text-sm font-medium text-white">{member.direct_referrals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Indirect Referrals</span>
                    <span className="text-sm font-medium text-white">{member.indirect_referrals}</span>
                  </div>
                </div>
              </div>

              {/* Referral Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:col-span-2">
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Referral Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-500">Referred By</p>
                    <p className="text-sm text-white">{member.referrer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">First Purchase</p>
                    <p className="text-sm text-white">
                      {member.first_purchase_date ? new Date(member.first_purchase_date).toLocaleDateString() : 'Not yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Activation Date</p>
                    <p className="text-sm text-white">
                      {member.activation_date ? new Date(member.activation_date).toLocaleDateString() : 'Not activated'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Profile Complete</p>
                    <p className="text-sm text-white">
                      {member.registration_completed ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleViewFullProfile}
                className="flex-1 sm:flex-none rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                <User className="h-4 w-4 inline mr-2" />
                View Full Profile
              </button>
              <button
                onClick={handleViewGenealogy}
                className="flex-1 sm:flex-none rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                <GitBranch className="h-4 w-4 inline mr-2" />
                View Genealogy
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">Member not found</p>
          </div>
        )}
      </div>
    </div>
  );
}