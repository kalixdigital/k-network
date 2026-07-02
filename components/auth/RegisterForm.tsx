"use client";

import { useState } from "react";
import AuthHeader from "./AuthHeader";
import { supabase } from "@/lib/supabase/client";
import FormInput from "@/components/form/FormInput";
import FormPassword from "@/components/form/FormPassword";
import FormSelect from "@/components/form/FormSelect";
import FormCheckbox from "@/components/form/FormCheckbox";
import SubmitButton from "@/components/form/SubmitButton";
import { nigeriaStates } from "@/lib/nigeria-states";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referral.trim()) {
      alert("Please enter the Member ID of the person who referred you.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!agree) {
      alert("You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Starting registration...");
      console.log("📧 Email:", email);

      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            country,
            state,
          },
        },
      });

      if (error) {
        setLoading(false);
        console.error("❌ SignUp error:", error);
        alert(`Registration error: ${error.message || 'Unknown error'}`);
        return;
      }

      if (!data || !data.user) {
        setLoading(false);
        alert("Registration failed. Please try again.");
        return;
      }

      console.log("✅ User created:", data.user.id);

      // Generate Member ID
      const today = new Date();
      const yy = today.getFullYear().toString().slice(-2);
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      const idNumber = `KN-${yy}${mm}${dd}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      console.log("🆔 Member ID:", idNumber);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (existingProfile) {
        console.log("✅ Profile already exists, continuing...");
        setLoading(false);
        alert("Registration successful!");
        window.location.href = '/login';
        return;
      }

      // Insert profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          id_number: idNumber,
          full_name: fullName,
          phone,
          email,
          country,
          state,
          referred_by: referral || null,
          membership_level: 1,
          monthly_points: 0,
          lifetime_points: 0,
          monthly_earnings: 0,
          lifetime_earnings: 0,
          direct_referrals: 0,
          indirect_referrals: 0,
          is_verified: false,
          role: 'user',
        });

      if (profileError) {
        console.error("❌ Profile error details:", {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          status: profileError.status,
          statusText: profileError.statusText,
        });
        
        // Show specific error message
        let errorMessage = "Profile creation failed.";
        
        if (profileError.code === '23505') {
          errorMessage = "This profile already exists. Please try again.";
        } else if (profileError.message?.includes('permission')) {
          errorMessage = "Permission denied. Please check your RLS policies.";
        } else if (profileError.code === '42P01') {
          errorMessage = "The profiles table doesn't exist. Please create it first.";
        } else {
          errorMessage = `Profile creation error: ${profileError.message || 'Unknown error'}`;
        }
        
        alert(errorMessage);
        setLoading(false);
        return;
      }

      console.log("✅ Profile created successfully");

      // Create activity log
      try {
        await supabase
          .from("activities")
          .insert({
            user_id: data.user.id,
            title: "Account Created",
            description: "Welcome to K-NETWORK",
            type: "account",
          });
      } catch (activityError) {
        console.warn("Activity log error:", activityError);
      }

      setLoading(false);

      alert(
        "Registration successful! Please check your email to verify your account."
      );

      window.location.href = '/login';

    } catch (err) {
      console.error("💥 Unexpected error:", err);
      setLoading(false);
      alert(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
      <AuthHeader
        title="Create Account"
        description="Join K-NETWORK today."
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <FormInput
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <FormInput
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormSelect
          label="Country"
          placeholder="Select Country"
          value={country}
          onValueChange={setCountry}
          options={["Nigeria"]}
        />

        <FormSelect
          label="State"
          placeholder="Select State"
          value={state}
          onValueChange={setState}
          options={nigeriaStates}
        />

        <FormPassword
          label="Password"
          value={password}
          onChange={setPassword}
          showStrength
        />

        <FormPassword
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <FormInput
          label="Referral By"
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
        />

        <FormCheckbox
          checked={agree}
          onCheckedChange={setAgree}
          label="I agree to the Terms & Conditions"
        />

        <SubmitButton loading={loading}>
          Create Account
        </SubmitButton>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}