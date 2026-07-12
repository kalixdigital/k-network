"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  ArrowLeft, 
  Save, 
  Award, 
  Star, 
  Crown,
  Users,
  ShoppingBag,
  TrendingUp,
  Clock,
  UserCheck,
  Users as UsersIcon,
  Coins,
  Gift,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";

type MembershipLevel = {
  id: number;
  name: string;
  min_monthly_points: number;
  min_active_direct_referrals: number;
  min_purchases_per_month: number;
  min_active_referrals_per_month: number;
  min_team_points: number;
  min_downline_level: number;
  min_downline_count: number;
  min_consecutive_months: number;
  requires_first_purchase: boolean;
  requires_profile_complete: boolean;
  requires_active_status: boolean;
  benefits: string[]; // Now it's text[] in DB
  is_active: boolean;
};

const levelIcons: Record<number, React.ReactNode> = {
  1: <Star className="h-6 w-6 text-slate-400" />,
  2: <Award className="h-6 w-6 text-amber-400" />,
  3: <Crown className="h-6 w-6 text-slate-300" />,
  4: <Crown className="h-6 w-6 text-yellow-400" />,
  5: <Crown className="h-6 w-6 text-emerald-400" />,
  6: <Crown className="h-6 w-6 text-cyan-400" />,
};

export default function EditMembershipLevelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [level, setLevel] = useState<MembershipLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [benefitsInput, setBenefitsInput] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(["basic"]);

  useEffect(() => {
    loadLevel();
  }, [id]);

  const loadLevel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("membership_levels")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (error) throw error;
      setLevel(data);
      // benefits is text[] - join with comma
      setBenefitsInput(data.benefits?.join(", ") || "");
    } catch (error) {
      console.error("Error loading level:", error);
      showToast.error("Failed to load membership level");
      router.push("/admin/settings/membership-levels");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!level) return;
    setSaving(true);

    try {
      // Parse benefits from comma-separated string to array
      const benefits = benefitsInput.split(",").map(b => b.trim()).filter(Boolean);
      
      const updateData = {
        name: level.name,
        min_monthly_points: level.min_monthly_points || 0,
        min_active_direct_referrals: level.min_active_direct_referrals || 0,
        min_purchases_per_month: level.min_purchases_per_month || 0,
        min_active_referrals_per_month: level.min_active_referrals_per_month || 0,
        min_team_points: level.min_team_points || 0,
        min_downline_level: level.min_downline_level || 0,
        min_downline_count: level.min_downline_count || 0,
        min_consecutive_months: level.min_consecutive_months || 0,
        requires_first_purchase: level.requires_first_purchase || false,
        requires_profile_complete: level.requires_profile_complete || false,
        requires_active_status: level.requires_active_status || false,
        benefits: benefits, // This should match text[] type
        is_active: level.is_active !== undefined ? level.is_active : true,
        updated_at: new Date().toISOString(),
      };

      console.log("Saving level data:", updateData);

      const { error } = await supabase
        .from("membership_levels")
        .update(updateData)
        .eq("id", level.id);

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      showToast.success(`Level "${level.name}" updated successfully!`);
      router.push("/admin/settings/membership-levels");
    } catch (error: any) {
      console.error("Error saving level:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      showToast.error(error.message || "Failed to save level");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Rest of the component remains the same...

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading level details...</p>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Level not found</p>
        <button
          onClick={() => router.push("/admin/settings/membership-levels")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Levels
        </button>
      </div>
    );
  }

  const icon = levelIcons[level.id] || levelIcons[1];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/settings/membership-levels")}
          className="rounded-lg p-2 hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Level {level.id}</h1>
            <p className="text-sm text-slate-400">{level.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => toggleSection("basic")}
            className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold text-white">Basic Information</span>
            </div>
            {expandedSections.includes("basic") ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
          {expandedSections.includes("basic") && (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400">Level Name</label>
                <input
                  type="text"
                  value={level.name}
                  onChange={(e) => setLevel({ ...level, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  <input
                    type="checkbox"
                    checked={level.is_active}
                    onChange={(e) => setLevel({ ...level, is_active: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  Active
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Points & Referrals */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => toggleSection("points")}
            className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold text-white">Points & Referrals</span>
            </div>
            {expandedSections.includes("points") ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
          {expandedSections.includes("points") && (
            <div className="px-6 pb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  Min Monthly Points
                </label>
                <input
                  type="number"
                  value={level.min_monthly_points}
                  onChange={(e) => setLevel({ ...level, min_monthly_points: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Min Direct Referrals
                </label>
                <input
                  type="number"
                  value={level.min_active_direct_referrals}
                  onChange={(e) => setLevel({ ...level, min_active_direct_referrals: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  Min Purchases/Month
                </label>
                <input
                  type="number"
                  value={level.min_purchases_per_month}
                  onChange={(e) => setLevel({ ...level, min_purchases_per_month: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <Gift className="h-4 w-4" />
                  Min Active Referrals/Month
                </label>
                <input
                  type="number"
                  value={level.min_active_referrals_per_month}
                  onChange={(e) => setLevel({ ...level, min_active_referrals_per_month: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Team & Downline */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => toggleSection("team")}
            className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <UsersIcon className="h-5 w-5 text-purple-400" />
              <span className="font-semibold text-white">Team & Downline</span>
            </div>
            {expandedSections.includes("team") ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
          {expandedSections.includes("team") && (
            <div className="px-6 pb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Min Team Points
                </label>
                <input
                  type="number"
                  value={level.min_team_points}
                  onChange={(e) => setLevel({ ...level, min_team_points: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">Total points of all downlines</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  Min Downline Count
                </label>
                <input
                  type="number"
                  value={level.min_downline_count}
                  onChange={(e) => setLevel({ ...level, min_downline_count: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">Number of downlines at required level</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  Min Downline Level
                </label>
                <input
                  type="number"
                  value={level.min_downline_level}
                  onChange={(e) => setLevel({ ...level, min_downline_level: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">Minimum level required for downlines</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Consecutive Months
                </label>
                <input
                  type="number"
                  value={level.min_consecutive_months}
                  onChange={(e) => setLevel({ ...level, min_consecutive_months: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">Months maintaining this level</p>
              </div>
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => toggleSection("requirements")}
            className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">Requirements</span>
            </div>
            {expandedSections.includes("requirements") ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
          {expandedSections.includes("requirements") && (
            <div className="px-6 pb-6 space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={level.requires_first_purchase}
                  onChange={(e) => setLevel({ ...level, requires_first_purchase: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                Requires First Purchase
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={level.requires_profile_complete}
                  onChange={(e) => setLevel({ ...level, requires_profile_complete: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                Requires Profile Complete
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={level.requires_active_status}
                  onChange={(e) => setLevel({ ...level, requires_active_status: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                Requires Active Status
              </label>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => toggleSection("benefits")}
            className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-amber-400" />
              <span className="font-semibold text-white">Benefits</span>
            </div>
            {expandedSections.includes("benefits") ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
          {expandedSections.includes("benefits") && (
            <div className="px-6 pb-6">
              <label className="block text-sm font-medium text-slate-400">Benefits (comma separated)</label>
              <input
                type="text"
                value={benefitsInput}
                onChange={(e) => setBenefitsInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Benefit 1, Benefit 2, Benefit 3"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {benefitsInput.split(",").map((b, i) => {
                  const trimmed = b.trim();
                  if (trimmed) {
                    return (
                      <span key={i} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                        {trimmed}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => router.push("/admin/settings/membership-levels")}
            className="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}