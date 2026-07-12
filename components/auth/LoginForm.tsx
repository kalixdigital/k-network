"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

import AuthHeader from "./AuthHeader";
import FormInput from "@/components/form/FormInput";
import FormPassword from "@/components/form/FormPassword";
import FormCheckbox from "@/components/form/FormCheckbox";
import SubmitButton from "@/components/form/SubmitButton";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileWithRetry = async (userId: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔍 Fetching profile attempt ${i + 1}...`);
        
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, full_name, is_verified")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error(`❌ Profile fetch error (attempt ${i + 1}):`, error);
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
          continue;
        }

        if (profile) {
          console.log("✅ Profile found:", profile);
          return profile;
        }

        if (i < retries - 1) {
          console.log("⏳ Profile not found, retrying...");
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        }
      } catch (err) {
        console.error(`💥 Attempt ${i + 1} failed:`, err);
        if (i === retries - 1) throw err;
      }
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!email.trim()) {
      showToast.error("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      showToast.error("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Attempting login...");
      console.log("📧 Email:", email);
      console.log("🔀 Redirect to:", redirectTo);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        console.error("❌ Login error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        
        if (error.message === "Invalid login credentials") {
          showToast.error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          showToast.error("Please verify your email address before logging in. Check your inbox for the confirmation link.");
        } else if (error.message.toLowerCase().includes("rate limit")) {
          showToast.error("Too many login attempts. Please wait a moment and try again.");
        } else {
          showToast.error(`Login error: ${error.message}`);
        }
        return;
      }

      if (!data || !data.user) {
        setLoading(false);
        showToast.error("Login failed. Please try again.");
        return;
      }

      console.log("✅ User logged in:", data.user.id);

      const profile = await fetchProfileWithRetry(data.user.id);

      if (!profile) {
        setLoading(false);
        showToast.error("Unable to fetch user profile. Please try again.");
        return;
      }

      console.log("👤 User role:", profile?.role);
      console.log("🔐 Is admin?", profile?.role === "admin");
      console.log("✅ Is verified:", profile?.is_verified);

      if (profile?.is_verified === false) {
        setLoading(false);
        showToast.error("Your account is pending verification. Please contact support.");
        return;
      }

      setLoading(false);
      setError(null);

      showToast.success(`Welcome back, ${profile?.full_name || 'User'}! 🎉`);

      let finalRedirect = redirectTo;
      
      if (profile?.role === "admin" && redirectTo === "/checkout") {
        finalRedirect = "/admin";
      } else if (profile?.role === "admin") {
        finalRedirect = "/admin";
      } else if (profile?.role !== "admin" && redirectTo === "/checkout") {
        finalRedirect = "/checkout";
      }

      console.log("🚀 Redirecting to:", finalRedirect);
      
      setTimeout(() => {
        router.push(finalRedirect);
        router.refresh();
      }, 500);

    } catch (err) {
      console.error("💥 Unexpected error:", err);
      setLoading(false);
      showToast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-8 shadow-2xl">
      <AuthHeader
        title="Welcome Back"
        description="Sign in to your K-NETWORK account."
      />

      <form onSubmit={onSubmit} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <FormInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          required
        />

        <FormPassword
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setError(null);
          }}
          placeholder="Enter your password"
        />

        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-0">
          <FormCheckbox
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked)}
            label="Remember me"
          />

          <Link
            href="/forgot-password"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors text-left xs:text-right"
          >
            Forgot Password?
          </Link>
        </div>

        <SubmitButton loading={loading}>
          Sign In
        </SubmitButton>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}