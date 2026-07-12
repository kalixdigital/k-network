"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import AuthHeader from "./AuthHeader";
import FormInput from "@/components/form/FormInput";
import FormPassword from "@/components/form/FormPassword";
import FormCheckbox from "@/components/form/FormCheckbox";
import SubmitButton from "@/components/form/SubmitButton";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Form state - Only essential fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referral, setReferral] = useState("");
  const [referralName, setReferralName] = useState("");
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get referral from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      const cleanRef = ref.toUpperCase().trim();
      setReferral(cleanRef);
      validateReferralCode(cleanRef);
    }
  }, [searchParams]);

  // Validate referral code using RPC
  const validateReferralCode = async (code: string): Promise<boolean> => {
    if (!code || code.length < 3) {
      setReferralValid(null);
      setReferralName("");
      return false;
    }

    setCheckingReferral(true);
    
    try {
      // Use the RPC function from database
      const { data, error } = await supabase.rpc(
        "validate_member_id",
        {
          member_code: code,
        }
      );

      if (error) {
        console.error("Validation error:", error);
        setReferralValid(false);
        setReferralName("");
        return false;
      }

      if (data && data.id) {
        setReferralValid(true);
        setReferralName(data.full_name || data.id_number);
        return true;
      }

      setReferralValid(false);
      setReferralName("");
      return false;
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setReferralValid(false);
      setReferralName("");
      return false;
    } finally {
      setCheckingReferral(false);
    }
  };

  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().trim();
    setReferral(value);
    setReferralValid(null);
    setReferralName("");
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    if (value.length >= 3) {
      debounceTimeout.current = setTimeout(() => validateReferralCode(value), 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!fullName.trim()) {
      showToast.error("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      showToast.error("Please enter your email");
      return;
    }

    if (!phone.trim()) {
      showToast.error("Please enter your phone number");
      return;
    }

    if (!referral.trim()) {
      showToast.error("Please enter the Member ID of the person who referred you");
      return;
    }

    if (!referralValid) {
      showToast.error("Invalid Member ID. Please check and try again.");
      return;
    }

    if (password !== confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      showToast.error("Password must be at least 6 characters");
      return;
    }

    if (!agree) {
      showToast.error("You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            referral_code: referral.trim(),
          },
        },
      });

      if (error) throw error;
      if (!data?.user) throw new Error("Registration failed");

      // 2. Wait for trigger to create profile
      let profileCreated = false;
      let retries = 0;
      while (!profileCreated && retries < 10) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();
        
        if (profile) {
          profileCreated = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        retries++;
      }

      if (!profileCreated) {
        throw new Error("Profile creation timed out. Please try again.");
      }

      // 3. Call register_user RPC function
      const { data: registerResult, error: registerError } = await supabase.rpc(
        "register_user",
        {
          p_user_id: data.user.id,
          p_full_name: fullName,
          p_phone: phone,
          p_email: email,
          p_country: "Nigeria",
          p_state: "",
          p_referral_code: referral.trim(),
        }
      );

      if (registerError) {
        console.error("Register RPC error:", registerError);
        throw new Error("Failed to complete registration");
      }

      if (registerResult && registerResult.success === false) {
        throw new Error(registerResult.error || "Registration failed");
      }

      showToast.success("Account created! Please complete your profile to continue.");
      
      setTimeout(() => {
        router.push('/complete-profile');
      }, 2000);

    } catch (error: any) {
      console.error("Registration error:", error);
      showToast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
      <AuthHeader
        title="Create Account"
        description="Join K-NETWORK today."
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Full Name */}
        <FormInput
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          required
        />

        {/* Email */}
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
        />

        {/* Phone */}
        <FormInput
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          required
        />

        {/* Password */}
        <FormPassword
          label="Password"
          value={password}
          onChange={setPassword}
          showStrength
          placeholder="Create a password (min 6 characters)"
        />

        {/* Confirm Password */}
        <FormPassword
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm your password"
        />

        {/* Referral Input - With real-time validation */}
        <div className="space-y-1">
          <FormInput
            label="Referral By (Member ID)"
            value={referral}
            onChange={handleReferralChange}
            placeholder="Enter the Member ID of your referrer"
            className={
              referralValid === true 
                ? "border-emerald-500" 
                : referralValid === false 
                ? "border-red-500" 
                : ""
            }
          />
          
          {checkingReferral && (
            <p className="text-sm text-yellow-400">⏳ Checking Member ID...</p>
          )}
          
          {referralValid === true && referralName && (
            <p className="text-sm text-emerald-400">✅ Referred by: {referralName}</p>
          )}
          
          {referralValid === false && referral.length >= 3 && (
            <p className="text-sm text-red-400">❌ Member ID "{referral}" not found.</p>
          )}
          
          <p className="text-xs text-slate-500">
            The referral bonus will be awarded after you complete your profile and make your first purchase.
          </p>
        </div>

        <FormCheckbox
          checked={agree}
          onCheckedChange={setAgree}
          label="I agree to the Terms & Conditions"
        />

        <SubmitButton loading={loading || checkingReferral}>
          {checkingReferral ? "Validating Referral..." : "Create Account"}
        </SubmitButton>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}