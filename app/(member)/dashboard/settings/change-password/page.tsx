"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userLevel = 1; // Default, we can get this from context later
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  const levelBorder = levelData.borderColor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.includes("Password should be different")) {
          showToast.error("New password must be different from current password");
        } else {
          showToast.error(error.message || "Failed to update password");
        }
        return;
      }

      showToast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/dashboard/settings");
    } catch (error) {
      console.error("Password update error:", error);
      showToast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
          <p className="text-sm text-slate-400">Update your account password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Password must be at least 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 rounded-lg ${levelBg} px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/settings")}
              className="flex-1 rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Security Tips */}
      <div className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
        <h3 className={`font-semibold mb-3 ${levelColor}`}>Password Tips</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className={`${levelColor} mt-0.5`}>•</span>
            Use at least 8 characters with a mix of letters, numbers, and symbols
          </li>
          <li className="flex items-start gap-2">
            <span className={`${levelColor} mt-0.5`}>•</span>
            Avoid using common words or personal information
          </li>
          <li className="flex items-start gap-2">
            <span className={`${levelColor} mt-0.5`}>•</span>
            Don't reuse passwords across different accounts
          </li>
          <li className="flex items-start gap-2">
            <span className={`${levelColor} mt-0.5`}>•</span>
            Change your password regularly for better security
          </li>
        </ul>
      </div>
    </div>
  );
}