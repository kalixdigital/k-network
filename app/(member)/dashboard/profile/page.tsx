"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import ProfileHeader from "@/components/dashboard/profile/ProfileHeader";
import ProfileStats from "@/components/dashboard/profile/ProfileStats";
import ProfileInfo from "@/components/dashboard/profile/ProfileInfo";
import ProfileForm from "@/components/dashboard/profile/ProfileForm";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  country: string;
  state: string;
  address: string;
  gender: string;
  date_of_birth: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
  membership_level: number;
  points: number;
  total_earnings: number;
  monthly_points: number;
  lifetime_points: number;
  direct_referrals: number;
  // indirect_referrals removed
  is_verified: boolean;
  is_active: boolean;
  registration_completed: boolean;
  created_at: string;
  updated_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async (formData: any) => {
    if (!profile) return;
    setSaving(true);

    try {
      // Only update editable fields (Bank & Next of Kin)
      const updateData = {
        bank_name: formData.bank_name,
        bank_account_number: formData.bank_account_number,
        bank_account_name: formData.bank_account_name,
        next_of_kin_name: formData.next_of_kin_name,
        next_of_kin_phone: formData.next_of_kin_phone,
        next_of_kin_relationship: formData.next_of_kin_relationship,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...updateData });
      setEditing(false);
      showToast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      showToast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const userLevel = profile?.membership_level || 1;
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`h-8 w-8 animate-spin rounded-full border-4 ${levelData.bgColor} border-t-transparent mx-auto`} />
          <p className="text-slate-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <ProfileHeader
        full_name={profile.full_name}
        email={profile.email}
        phone={profile.phone}
        id_number={profile.id_number}
        membership_level={profile.membership_level}
        is_verified={profile.is_verified}
        is_active={profile.is_active}
        registration_completed={profile.registration_completed}
        onEdit={handleEdit}
      />

      {/* Stats - Indirect referrals removed */}
      <ProfileStats
        points={profile.points}
        total_earnings={profile.total_earnings}
        monthly_points={profile.monthly_points}
        lifetime_points={profile.lifetime_points}
        direct_referrals={profile.direct_referrals}
        // indirect_referrals removed
        userLevel={profile.membership_level}
      />

      {/* Edit Form or Info Display */}
      {editing ? (
        <div className={`rounded-2xl border ${levelData.borderColor} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
          <ProfileForm
            profile={profile}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            userLevel={profile.membership_level}
          />
        </div>
      ) : (
        <ProfileInfo profile={profile} userLevel={profile.membership_level} />
      )}
    </div>
  );
}