"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import SubmitButton from "@/components/form/SubmitButton";
import FormInput from "@/components/form/FormInput";
import FormSelect from "@/components/form/FormSelect";
import { nigeriaStates } from "@/lib/nigeria-states";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Profile fields - Only fields that weren't in registration
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [nextOfKinName, setNextOfKinName] = useState("");
  const [nextOfKinPhone, setNextOfKinPhone] = useState("");
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    
    // Check if profile is already completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setProfile(profile);
    
    if (profile?.registration_completed) {
      showToast.info("Your profile is already complete!");
      router.push('/dashboard');
      return;
    }

    // Pre-fill if data exists
    if (profile) {
      setCountry(profile.country || "Nigeria");
      setState(profile.state || "");
      setAddress(profile.address || "");
      setGender(profile.gender || "");
      setDateOfBirth(profile.date_of_birth || "");
      setBankName(profile.bank_name || "");
      setBankAccountNumber(profile.bank_account_number || "");
      setBankAccountName(profile.bank_account_name || "");
      setNextOfKinName(profile.next_of_kin_name || "");
      setNextOfKinPhone(profile.next_of_kin_phone || "");
      setNextOfKinRelationship(profile.next_of_kin_relationship || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build profile data for the RPC function
      const profileData = {
        profile_picture: "",
        address: address,
        gender: gender,
        date_of_birth: dateOfBirth,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        next_of_kin_name: nextOfKinName,
        next_of_kin_phone: nextOfKinPhone,
        next_of_kin_relationship: nextOfKinRelationship,
      };

      // Call the complete_profile RPC function
      const { data: result, error: rpcError } = await supabase.rpc(
        "complete_profile",
        {
          p_user_id: user.id,
          p_profile_data: profileData,
        }
      );

      if (rpcError) throw rpcError;

      // Also update the profile directly (backup)
      const { error } = await supabase
        .from("profiles")
        .update({
          country: country,
          state: state,
          address: address,
          gender: gender,
          date_of_birth: dateOfBirth,
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_name: bankAccountName,
          next_of_kin_name: nextOfKinName,
          next_of_kin_phone: nextOfKinPhone,
          next_of_kin_relationship: nextOfKinRelationship,
          registration_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      showToast.success("Profile completed successfully! Activate your account by purchasing a product.");
      router.push('/products');
      
    } catch (error: any) {
      console.error("Profile completion error:", error);
      showToast.error(error.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm mt-2">
            Complete your profile to activate your account and start earning.
            <br />
            <span className="text-yellow-400 text-xs">
              ⚠️ You have 3 days to complete your profile. Incomplete profiles will be deleted.
            </span>
          </p>
          {profile && (
            <p className="text-sm text-slate-500 mt-2">
              Member ID: <span className="text-emerald-400 font-mono">{profile.id_number}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country - Already had during registration but allowing update */}
          <FormSelect
            label="Country"
            placeholder="Select Country"
            value={country}
            onValueChange={setCountry}
            options={["Nigeria"]}
          />

          {/* State - Already had during registration but allowing update */}
          <FormSelect
            label="State"
            placeholder="Select State"
            value={state}
            onValueChange={setState}
            options={nigeriaStates}
          />

          <FormInput
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your residential address"
            required
          />

          <FormSelect
            label="Gender"
            placeholder="Select Gender"
            value={gender}
            onValueChange={setGender}
            options={["Male", "Female", "Other"]}
          />

          <FormInput
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-white font-semibold mb-4">Bank Details</h3>
            
            <FormInput
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Enter your bank name"
            />

            <FormInput
              label="Account Number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="Enter your account number"
            />

            <FormInput
              label="Account Name"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="Enter the account holder name"
            />
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-white font-semibold mb-4">Next of Kin</h3>
            
            <FormInput
              label="Full Name"
              value={nextOfKinName}
              onChange={(e) => setNextOfKinName(e.target.value)}
              placeholder="Enter next of kin's full name"
            />

            <FormInput
              label="Phone Number"
              value={nextOfKinPhone}
              onChange={(e) => setNextOfKinPhone(e.target.value)}
              placeholder="Enter next of kin's phone number"
            />

            <FormInput
              label="Relationship"
              value={nextOfKinRelationship}
              onChange={(e) => setNextOfKinRelationship(e.target.value)}
              placeholder="e.g., Spouse, Child, Parent"
            />
          </div>

          <SubmitButton loading={loading}>
            Complete Registration
          </SubmitButton>

          <p className="text-xs text-slate-500 text-center">
            After completing your profile, you'll be redirected to purchase your first product to activate your account.
          </p>
        </form>
      </div>
    </div>
  );
}