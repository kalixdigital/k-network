"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import AuthHeader from "@/components/auth/AuthHeader";
import FormPassword from "@/components/form/FormPassword";
import SubmitButton from "@/components/form/SubmitButton";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasHash, setHasHash] = useState(false);

  useEffect(() => {
    async function handleResetPassword() {
      try {
        console.log("🔍 Checking reset password session...");
        
        // Check if we have a hash in the URL (from email link)
        const hash = window.location.hash;
        console.log("📍 Hash in URL:", hash);
        
        if (hash) {
          setHasHash(true);
          console.log("✅ Hash found in URL");
          
          // Parse hash parameters
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          console.log("🔑 Access token:", accessToken ? "Present" : "Missing");
          console.log("🔄 Refresh token:", refreshToken ? "Present" : "Missing");
          console.log("📝 Type:", type);
          
          // If we have tokens, try to set the session
          if (accessToken && refreshToken) {
            console.log("🔄 Setting session from tokens...");
            
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error("❌ Error setting session:", error);
              setError("Invalid or expired reset link. Please request a new one.");
              setIsValid(false);
              setIsChecking(false);
              return;
            }
            
            if (data.session) {
              console.log("✅ Session set successfully");
              setIsValid(true);
              setIsChecking(false);
              return;
            }
          }
          
          // If we have a type='recovery' but no tokens
          if (type === 'recovery') {
            console.log("📝 Recovery type detected");
            // Try to get session after a short delay
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                console.log("✅ Session found after delay");
                setIsValid(true);
              } else {
                setError("Invalid or expired reset link. Please request a new one.");
                setIsValid(false);
              }
              setIsChecking(false);
            }, 1000);
            return;
          }
        }
        
        // If no hash, check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Session error:", sessionError);
          setError("Invalid or expired reset link. Please request a new one.");
          setIsValid(false);
          setIsChecking(false);
          return;
        }
        
        if (session) {
          console.log("✅ Existing session found");
          setIsValid(true);
          setIsChecking(false);
          return;
        }
        
        // No session and no hash
        console.log("⚠️ No reset session found");
        // If user is on the page directly without a reset link, show a message
        if (!hash) {
          setError("No reset link detected. Please request a password reset from the login page.");
        } else {
          setError("Invalid or expired reset link. Please request a new one.");
        }
        setIsValid(false);
        setIsChecking(false);
        
      } catch (err) {
        console.error("💥 Error checking session:", err);
        setError("An error occurred. Please try again.");
        setIsValid(false);
        setIsChecking(false);
      }
    }
    
    handleResetPassword();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError("Invalid reset session. Please request a new reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Updating password...");

      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("❌ Password update error:", error);
        
        if (error.message.includes("session")) {
          setError("Your session has expired. Please request a new reset link.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      console.log("✅ Password updated successfully", data);
      setSuccess(true);
      setLoading(false);

      // Sign out after password reset
      await supabase.auth.signOut();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 3000);

    } catch (err) {
      console.error("💥 Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid state
  if (!isValid && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {hasHash ? "Invalid Reset Link" : "Password Reset"}
          </h2>
          <p className="text-red-400 mb-6">{error}</p>
          {!hasHash && (
            <div className="bg-slate-800 p-4 rounded-lg mb-6 text-left">
              <p className="text-slate-300 text-sm mb-2">To reset your password:</p>
              <ol className="text-slate-400 text-sm list-decimal list-inside space-y-1">
                <li>Click "Forgot Password" on the login page</li>
                <li>Enter your email address</li>
                <li>Check your email for the reset link</li>
                <li>Click the link in the email</li>
              </ol>
            </div>
          )}
          {hasHash && (
            <p className="text-slate-400 text-sm mb-6">
              The password reset link may have expired or been used already.
            </p>
          )}
          <div className="space-y-3">
            <Link
              href="/forgot-password"
              className="block w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Request New Link
            </Link>
            <Link
              href="/login"
              className="block w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Password Reset Successful!
          </h2>
          <p className="text-slate-400 mb-6">
            Your password has been updated successfully.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to login...
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
        <AuthHeader
          title="Reset Password"
          description="Enter your new password below."
        />

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <FormPassword
            label="New Password"
            value={password}
            onChange={setPassword}
            showStrength
            placeholder="Enter new password (min 6 characters)"
          />

          <FormPassword
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your new password"
          />

          <div className="space-y-3">
            <SubmitButton loading={loading}>
              Reset Password
            </SubmitButton>

            <Link
              href="/login"
              className="block w-full text-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}