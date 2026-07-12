"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  ArrowLeft, 
  Gift, 
  Coins, 
  TrendingUp, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Banknote,
  Users,
  Award
} from "lucide-react";
import Link from "next/link";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  membership_level: number;
  points: number;
  total_earnings: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  is_active: boolean;
  is_verified: boolean;
};

type RedeemOption = {
  id: string;
  name: string;
  description: string;
  points_required: number;
  cash_value: number;
  icon: string;
};

const LEVELS: Record<number, { name: string; icon: string }> = {
  1: { name: "Beginner", icon: "🌟" },
  2: { name: "Bronze", icon: "🥉" },
  3: { name: "Silver", icon: "🥈" },
  4: { name: "Gold", icon: "🥇" },
  5: { name: "Platinum", icon: "💎" },
  6: { name: "Diamond", icon: "👑" },
};

export default function RedeemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
  });

  const redeemOptions: RedeemOption[] = [
    {
      id: "cash",
      name: "Cash Withdrawal",
      description: "Convert points to cash sent to your bank account",
      points_required: 100,
      cash_value: 1000,
      icon: "💰",
    },
    {
      id: "voucher",
      name: "Gift Voucher",
      description: "Redeem points for gift vouchers",
      points_required: 50,
      cash_value: 500,
      icon: "🎁",
    },
    {
      id: "product",
      name: "Free Product",
      description: "Redeem points for free products",
      points_required: 200,
      cash_value: 2000,
      icon: "📦",
    },
  ];

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
      setBankDetails({
        bank_name: data.bank_name || "",
        account_number: data.bank_account_number || "",
        account_name: data.bank_account_name || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    const option = redeemOptions.find(o => o.id === optionId);
    if (!option) return;

    setSelectedOption(optionId);
    setPointsToRedeem(option.points_required);
    setAmount(option.cash_value);
  };

  const handleRedeem = async () => {
    if (!profile) return;
    if (!selectedOption) {
      showToast.error("Please select a redemption option");
      return;
    }

    const option = redeemOptions.find(o => o.id === selectedOption);
    if (!option) return;

    // Check if user has enough points
    if (profile.points < option.points_required) {
      showToast.error(`You need ${option.points_required} points to redeem this option`);
      return;
    }

    // Check if user is level 2 or higher
    if (profile.membership_level < 2) {
      showToast.error("You need to be at least Bronze level to redeem points");
      return;
    }

    // Validate bank details for cash withdrawal
    if (selectedOption === "cash") {
      if (!bankDetails.bank_name || !bankDetails.account_number || !bankDetails.account_name) {
        showToast.error("Please complete your bank details in your profile first");
        return;
      }
    }

    setSubmitting(true);

    try {
      // Create redemption request
      const { data, error } = await supabase
        .from("withdrawals")
        .insert({
          user_id: profile.id,
          amount: amount,
          points: option.points_required,
          type: selectedOption,
          status: "pending",
          bank_name: bankDetails.bank_name,
          bank_account_number: bankDetails.account_number,
          bank_account_name: bankDetails.account_name,
          description: `Redeemed ${option.points_required} points for ${option.name}`,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct points from user
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          points: profile.points - option.points_required,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Record points history
      await supabase.from("points_history").insert({
        user_id: profile.id,
        points: -option.points_required,
        source: "redeem",
        description: `Redeemed ${option.points_required} points for ${option.name}`,
        created_at: new Date().toISOString(),
      });

      showToast.success(`Successfully redeemed ${option.name}!`);
      
      // Refresh profile
      await loadProfile();
      
      // Reset form
      setSelectedOption(null);
      setPointsToRedeem(0);
      setAmount(0);

    } catch (error: any) {
      console.error("Error redeeming:", error);
      showToast.error(error.message || "Failed to redeem points");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <p className="text-slate-400 mt-4">Profile not found</p>
      </div>
    );
  }

  const levelInfo = LEVELS[profile.membership_level] || LEVELS[1];
  const isEligible = profile.membership_level >= 2;
  const selectedOptionData = redeemOptions.find(o => o.id === selectedOption);

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
          <h1 className="text-2xl font-bold text-white">Redeem Points</h1>
          <p className="text-sm text-slate-400">Convert your points to cash or rewards</p>
        </div>
      </div>

      {/* Eligibility Check */}
      <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur ${
        isEligible 
          ? 'border-emerald-500/20 bg-emerald-950/20' 
          : 'border-yellow-500/20 bg-yellow-950/20'
      }`}>
        <div className="flex items-center gap-3">
          {isEligible ? (
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          ) : (
            <Lock className="h-6 w-6 text-yellow-400" />
          )}
          <div>
            <p className={`font-semibold ${isEligible ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {isEligible ? '✅ You are eligible to redeem points' : '🔒 You need to be at least Bronze level to redeem points'}
            </p>
            <p className="text-sm text-slate-400">
              Current Level: {levelInfo.icon} {levelInfo.name} • 
              Available Points: {profile.points.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Redemption Options */}
      <div className="grid gap-4 md:grid-cols-3">
        {redeemOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const isDisabled = !isEligible || profile.points < option.points_required;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isDisabled}
              className={`rounded-2xl border p-6 text-left transition-all ${
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                  : isDisabled
                  ? 'border-slate-800 bg-slate-900/30 opacity-50 cursor-not-allowed'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="text-3xl mb-3">{option.icon}</div>
              <h3 className="font-semibold text-white">{option.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{option.description}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-emerald-400">{option.points_required} pts</span>
                <span className="text-slate-400">≈ ₦{option.cash_value.toLocaleString()}</span>
              </div>
              {isSelected && (
                <div className="mt-3 rounded-lg bg-emerald-500/10 p-2 text-center text-xs text-emerald-400">
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bank Details (for cash withdrawal) */}
      {selectedOption === "cash" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-400" />
            Bank Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-400">Bank Name</label>
              <input
                type="text"
                value={bankDetails.bank_name}
                onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., GTBank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Account Number</label>
              <input
                type="text"
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Account Name</label>
              <input
                type="text"
                value={bankDetails.account_name}
                onChange={(e) => setBankDetails({ ...bankDetails, account_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Account holder name"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            💡 Update your bank details in your profile settings
          </p>
        </div>
      )}

      {/* Redemption Summary */}
      {selectedOption && selectedOptionData && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 shadow-xl backdrop-blur">
          <h3 className="font-semibold text-white mb-4">Redemption Summary</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Option</p>
              <p className="font-medium text-white">{selectedOptionData.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Points to Redeem</p>
              <p className="font-medium text-emerald-400">{pointsToRedeem.toLocaleString()} pts</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Value</p>
              <p className="font-medium text-white">₦{amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Remaining Points</p>
              <p className="font-medium text-white">{(profile.points - pointsToRedeem).toLocaleString()} pts</p>
            </div>
          </div>

          <button
            onClick={handleRedeem}
            disabled={submitting || !isEligible || profile.points < pointsToRedeem}
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Processing...
              </>
            ) : (
              `Confirm Redemption`
            )}
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-emerald-400" />
          How Redemption Works
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>• You need to be at least <span className="text-emerald-400">Bronze level</span> to redeem points</li>
          <li>• Minimum redemption is <span className="text-emerald-400">100 points</span> (₦1,000)</li>
          <li>• Redemption requests are processed within <span className="text-emerald-400">24-48 hours</span></li>
          <li>• Points deducted from your account will be added to your points history</li>
          <li>• You can track your redemption status in your <Link href="/dashboard/withdrawals" className="text-emerald-400 hover:underline">withdrawals</Link> page</li>
        </ul>
      </div>
    </div>
  );
}