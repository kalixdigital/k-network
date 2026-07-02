"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

import AuthHeader from "./AuthHeader";
import FormInput from "@/components/form/FormInput";
import FormPassword from "@/components/form/FormPassword";
import FormCheckbox from "@/components/form/FormCheckbox";
import SubmitButton from "@/components/form/SubmitButton";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Validate inputs
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Attempting login...");
      console.log("📧 Email:", email);

      // Sign in user
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
        
        // Show more specific error messages
        if (error.message === "Invalid login credentials") {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setError("Please verify your email address before logging in. Check your inbox for the confirmation link.");
        } else if (error.message.toLowerCase().includes("rate limit")) {
          setError("Too many login attempts. Please wait a moment and try again.");
        } else {
          setError(`Login error: ${error.message}`);
        }
        return;
      }

      if (!data || !data.user) {
        setLoading(false);
        setError("Login failed. Please try again.");
        return;
      }

      console.log("✅ User logged in:", data.user.id);

      // Fetch user profile to get role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name, is_verified")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        setLoading(false);
        console.error("❌ Profile fetch error:", profileError);
        setError("Error fetching user profile. Please try again.");
        return;
      }

      console.log("👤 User role:", profile?.role);
      console.log("🔐 Is admin?", profile?.role === "admin");

      // Check if account is verified (if your app requires it)
      if (profile?.is_verified === false) {
        setLoading(false);
        setError("Your account is pending verification. Please contact support.");
        return;
      }

      setLoading(false);
      setError(null);

      // Redirect based on role
      if (profile?.role === "admin") {
        console.log("🚀 Redirecting to /admin");
        router.push("/admin");
        router.refresh();
      } else {
        console.log("🚀 Redirecting to /dashboard");
        router.push("/dashboard");
        router.refresh();
      }

    } catch (err) {
      console.error("💥 Unexpected error:", err);
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
      <AuthHeader
        title="Welcome Back"
        description="Sign in to your K-NETWORK account."
      />

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {/* Error Message */}
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

        <div className="flex items-center justify-between">
          <FormCheckbox
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked)}
            label="Remember me"
          />

          <Link
            href="/forgot-password"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
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