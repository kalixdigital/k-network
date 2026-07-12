"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  Award, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Crown, 
  TrendingUp,
  Coins,
  ShoppingBag,
  ChevronDown
} from "lucide-react";

export default function PromotionManager() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [promotedUsers, setPromotedUsers] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const runPromotionCheck = async () => {
    setLoading(true);
    setResult(null);
    setPromotedUsers([]);
    
    try {
      const { data, error } = await supabase.rpc("promote_all_eligible_users");
      
      console.log("Promotion response:", { data, error });
      
      if (error) {
        console.error("RPC Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(error.message || "Failed to run promotion check");
      }
      
      setResult(data);
      
      if (data?.success) {
        showToast.success(`✅ ${data.promoted_count || 0} users promoted!`);
        
        // If there were promotions, fetch the promoted users
        if (data.promoted_count > 0) {
          const { data: promoted } = await supabase
            .from("profiles")
            .select("id, full_name, id_number, membership_level, updated_at")
            .order("updated_at", { ascending: false })
            .limit(data.promoted_count);
          
          if (promoted) {
            setPromotedUsers(promoted);
          }
        }
      } else {
        showToast.warning(data?.message || "No users were promoted");
      }
    } catch (error: any) {
      console.error("Promotion error:", error);
      showToast.error(error.message || "Failed to run promotion check");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Membership Promotions</h1>
          <p className="text-sm text-slate-400">
            Automatically promote users based on monthly points and referrals
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="rounded-full bg-emerald-500/20 p-3 flex-shrink-0 self-start md:self-auto">
            <Award className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Promotion Rules</h2>
            <p className="text-sm text-slate-400">
              Users are automatically promoted when they meet the monthly points and referral requirements
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Coins className="h-3 w-3" />
              Monthly Points
            </p>
            <p className="text-lg font-bold text-yellow-400">Required</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Direct Referrals
            </p>
            <p className="text-lg font-bold text-purple-400">Required</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              Purchases/Month
            </p>
            <p className="text-lg font-bold text-blue-400">Required</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Auto-Promotion
            </p>
            <p className="text-lg font-bold text-emerald-400">Active ✅</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={runPromotionCheck}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              Run Promotion Check
            </>
          )}
        </button>

        {/* Result Display */}
        {result && (
          <div className={`mt-4 rounded-xl p-4 ${
            result.success 
              ? result.promoted_count > 0 
                ? "bg-emerald-500/10 border border-emerald-500/20" 
                : "bg-slate-800/30 border border-slate-700/50"
              : "bg-red-500/10 border border-red-500/20"
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                result.promoted_count > 0 ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                )
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${
                  result.success 
                    ? result.promoted_count > 0 
                      ? "text-emerald-400" 
                      : "text-slate-300"
                    : "text-red-400"
                }`}>
                  {result.message || (result.success 
                    ? `✅ ${result.promoted_count || 0} users promoted!` 
                    : "❌ Promotion check failed")}
                </p>
                {result.error && (
                  <p className="text-sm text-red-400 mt-1">Error: {result.error}</p>
                )}
                {result.success && result.promoted_count === 0 && (
                  <p className="text-sm text-slate-400 mt-1">
                    All users are already at their appropriate levels.
                  </p>
                )}
              </div>
            </div>

            {/* Promoted Users List */}
            {promotedUsers.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                >
                  {showDetails ? "Hide" : "Show"} promoted users
                  <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
                </button>
                
                {showDetails && (
                  <div className="mt-2 space-y-1.5">
                    {promotedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-white">{user.full_name}</p>
                          <p className="text-xs text-slate-400">{user.id_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Level</span>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                            {user.membership_level}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(user.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-white">How Promotion Works</h3>
        </div>
        <div className="mt-3 space-y-2 text-sm text-slate-400">
          <p>1. Users earn points through purchases and referrals</p>
          <p>2. System checks monthly points and active referrals</p>
          <p>3. When criteria are met, users are automatically promoted</p>
          <p>4. Promotion notifications are sent to users</p>
          <p className="text-emerald-400 mt-2">
            💡 You can configure criteria in Membership Levels settings
          </p>
        </div>
      </div>
    </div>
  );
}