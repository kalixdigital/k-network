"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import GenealogyTree from "@/components/dashboard/genealogy/GenealogyTree";
import MemberDetailsModal from "@/components/dashboard/genealogy/MemberDetailsModal";

type GenealogyNode = {
  id: string;
  full_name: string;
  id_number: string;
  email: string;
  phone?: string;
  membership_level: number;
  points: number;
  direct_referrals: number;
  is_active: boolean;
  joined_at: string;
  children?: GenealogyNode[];
};

type MemberDetails = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  membership_level: number;
  points: number;
  total_earnings: number;
  monthly_points: number;
  lifetime_points: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_active: boolean;
  is_verified: boolean;
  registration_completed: boolean;
  created_at: string;
  first_purchase_date: string | null;
  activation_date: string | null;
};

export default function GenealogyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState<GenealogyNode | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    loadGenealogy();
  }, []);

  const loadGenealogy = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);
        throw userError;
      }
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Use the RPC function to get the user's profile (bypasses RLS)
      const { data: userProfileData, error: profileError } = await supabase
        .rpc('get_my_profile');

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      if (!userProfileData) {
        console.error("No profile data found");
        showToast.error("Profile not found");
        return;
      }

      const userProfile = userProfileData;
      setUserLevel(userProfile.membership_level || 1);

      // Build genealogy tree
      const treeData = await buildGenealogyTree(user.id, userProfile);
      setTree(treeData);

    } catch (error: any) {
      console.error("Error loading genealogy:", error);
      showToast.error(error?.message || "Failed to load genealogy");
    } finally {
      setLoading(false);
    }
  };

  const buildGenealogyTree = async (userId: string, userProfile: any): Promise<GenealogyNode> => {
    // Get direct referrals - using the RPC function
    const { data: referrals, error } = await supabase
      .rpc('get_user_direct_referrals', { p_user_id: userId });

    if (error) {
      console.error("Error fetching referrals:", error);
      // Fallback to empty tree
      return {
        id: userProfile.id,
        full_name: userProfile.full_name,
        id_number: userProfile.id_number,
        email: userProfile.email,
        phone: userProfile.phone,
        membership_level: userProfile.membership_level,
        points: userProfile.points,
        direct_referrals: userProfile.direct_referrals,
        is_active: userProfile.is_active,
        joined_at: userProfile.created_at,
        children: [],
      };
    }

    // Build children recursively (limited to 2 levels deep for performance)
    const children = await Promise.all(
      (referrals || []).map(async (referral: any) => {
        // Get their referrals (level 2)
        const { data: subReferrals } = await supabase
          .rpc('get_user_direct_referrals', { p_user_id: referral.id });

        return {
          id: referral.id,
          full_name: referral.full_name,
          id_number: referral.id_number,
          email: referral.email,
          phone: referral.phone || '',
          membership_level: referral.membership_level,
          points: referral.points || 0,
          direct_referrals: referral.direct_referrals || 0,
          is_active: referral.is_active || false,
          joined_at: referral.created_at,
          children: (subReferrals || []).slice(0, 10).map((sub: any) => ({
            id: sub.id,
            full_name: sub.full_name,
            id_number: sub.id_number,
            email: sub.email,
            phone: sub.phone || '',
            membership_level: sub.membership_level,
            points: sub.points || 0,
            direct_referrals: sub.direct_referrals || 0,
            is_active: sub.is_active || false,
            joined_at: sub.created_at,
            children: [],
          })),
        };
      })
    );

    return {
      id: userProfile.id,
      full_name: userProfile.full_name,
      id_number: userProfile.id_number,
      email: userProfile.email,
      phone: userProfile.phone,
      membership_level: userProfile.membership_level,
      points: userProfile.points,
      direct_referrals: userProfile.direct_referrals,
      is_active: userProfile.is_active,
      joined_at: userProfile.created_at,
      children: children,
    };
  };

  const handleSelectUser = async (userId: string) => {
    try {
      if (!userId) {
        console.error("No user ID provided");
        showToast.error("Invalid user ID");
        return;
      }

      console.log("Loading member details for:", userId);

      const { data, error } = await supabase
        .rpc('get_member_details', { p_user_id: userId });

      if (error) {
        console.error("Member details fetch error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        showToast.error(error.message || "Failed to fetch member details");
        return;
      }

      if (!data) {
        console.error("No member found with ID:", userId);
        showToast.error("Member not found");
        return;
      }

      if (data.error) {
        showToast.error(data.error);
        return;
      }

      console.log("Member loaded:", data.full_name);
      setSelectedMember(data as MemberDetails);
      setIsModalOpen(true);

    } catch (error: any) {
      console.error("Error loading member details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      showToast.error(error?.message || "Failed to load member details");
    }
  };

  const levelData = getLevel(userLevel);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Genealogy</h1>
          <p className="text-sm text-slate-400">View your referral network structure</p>
        </div>
      </div>

      <GenealogyTree
        tree={tree}
        loading={loading}
        onSelectUser={handleSelectUser}
      />

      <MemberDetailsModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}