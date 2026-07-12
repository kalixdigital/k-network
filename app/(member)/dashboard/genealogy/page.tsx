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

      if (userError) throw userError;
      if (!user) {
        router.push("/login");
        return;
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      setUserLevel(userProfile.membership_level || 1);

      // Build genealogy tree
      const treeData = await buildGenealogyTree(user.id, userProfile);
      setTree(treeData);

    } catch (error) {
      console.error("Error loading genealogy:", error);
      showToast.error("Failed to load genealogy");
    } finally {
      setLoading(false);
    }
  };

  const buildGenealogyTree = async (userId: string, userProfile: any): Promise<GenealogyNode> => {
    // Get direct referrals - using the RPC function for proper UUID to TEXT conversion
    const { data: referrals, error } = await supabase
      .rpc('get_user_direct_referrals', { p_user_id: userId });

    if (error) {
      console.error("Error fetching referrals:", error);
      // Fallback to direct query
      const { data: fallbackReferrals, error: fallbackError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          id_number,
          email,
          phone,
          membership_level,
          points,
          direct_referrals,
          is_active,
          created_at
        `)
        .eq("referred_by", userId)
        .order("created_at", { ascending: true });

      if (fallbackError) {
        console.error("Fallback referral fetch error:", fallbackError);
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
        (fallbackReferrals || []).map(async (referral: any) => {
          // Get their referrals (level 2)
          const { data: subReferrals } = await supabase
            .from("profiles")
            .select(`
              id,
              full_name,
              id_number,
              email,
              phone,
              membership_level,
              points,
              direct_referrals,
              is_active,
              created_at
            `)
            .eq("referred_by", referral.id)
            .limit(10); // Limit to avoid huge trees

          return {
            id: referral.id,
            full_name: referral.full_name,
            id_number: referral.id_number,
            email: referral.email,
            phone: referral.phone,
            membership_level: referral.membership_level,
            points: referral.points,
            direct_referrals: referral.direct_referrals,
            is_active: referral.is_active,
            joined_at: referral.created_at,
            children: (subReferrals || []).map((sub: any) => ({
              id: sub.id,
              full_name: sub.full_name,
              id_number: sub.id_number,
              email: sub.email,
              phone: sub.phone,
              membership_level: sub.membership_level,
              points: sub.points,
              direct_referrals: sub.direct_referrals,
              is_active: sub.is_active,
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
    }

    // Build children recursively (limited to 2 levels deep for performance)
    const children = await Promise.all(
      (referrals || []).map(async (referral: any) => {
        // Get their referrals (level 2)
        const { data: subReferrals } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            id_number,
            email,
            phone,
            membership_level,
            points,
            direct_referrals,
            is_active,
            created_at
          `)
          .eq("referred_by", referral.id)
          .limit(10); // Limit to avoid huge trees

        return {
          id: referral.id,
          full_name: referral.full_name,
          id_number: referral.id_number,
          email: referral.email,
          phone: referral.phone,
          membership_level: referral.membership_level,
          points: referral.points,
          direct_referrals: referral.direct_referrals,
          is_active: referral.is_active,
          joined_at: referral.created_at,
          children: (subReferrals || []).map((sub: any) => ({
            id: sub.id,
            full_name: sub.full_name,
            id_number: sub.id_number,
            email: sub.email,
            phone: sub.phone,
            membership_level: sub.membership_level,
            points: sub.points,
            direct_referrals: sub.direct_referrals,
            is_active: sub.is_active,
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Member details fetch error:", error);
        throw error;
      }

      setSelectedMember(data as MemberDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error loading member details:", error);
      showToast.error("Failed to load member details");
    }
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;

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