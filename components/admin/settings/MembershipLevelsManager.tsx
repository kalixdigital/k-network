"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Award,
  Star,
  Users,
  ShoppingBag,
  TrendingUp,
  Crown,
  Clock,
  UserCheck,
  Users as UsersIcon,
  Coins,
  Gift,
  Settings,
  Eye
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
  benefits: string[];
  is_active: boolean;
};

// Level icons
const levelIcons: Record<number, React.ReactNode> = {
  1: <Star className="h-5 w-5 text-slate-400" />,
  2: <Award className="h-5 w-5 text-amber-400" />,
  3: <Crown className="h-5 w-5 text-slate-300" />,
  4: <Crown className="h-5 w-5 text-yellow-400" />,
  5: <Crown className="h-5 w-5 text-emerald-400" />,
  6: <Crown className="h-5 w-5 text-cyan-400" />,
};

// Level colors
const levelColors: Record<number, string> = {
  1: "border-slate-700 bg-slate-800/30",
  2: "border-amber-700/50 bg-amber-950/20",
  3: "border-slate-500/50 bg-slate-800/30",
  4: "border-yellow-600/50 bg-yellow-950/20",
  5: "border-emerald-500/50 bg-emerald-950/20",
  6: "border-cyan-400/50 bg-cyan-950/20",
};

export default function MembershipLevelsManager() {
  const router = useRouter();
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [benefitsInput, setBenefitsInput] = useState("");
  const [newLevel, setNewLevel] = useState<Partial<MembershipLevel>>({
    name: "",
    min_monthly_points: 0,
    min_active_direct_referrals: 0,
    min_purchases_per_month: 0,
    min_active_referrals_per_month: 0,
    min_team_points: 0,
    min_downline_level: 0,
    min_downline_count: 0,
    min_consecutive_months: 0,
    requires_first_purchase: false,
    requires_profile_complete: false,
    requires_active_status: false,
    benefits: [],
    is_active: true,
  });

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("membership_levels")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error("Error loading membership levels:", error);
      showToast.error("Failed to load membership levels");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevel = async () => {
    if (!newLevel.name) {
      showToast.error("Level name is required");
      return;
    }

    try {
      const benefits = benefitsInput.split(",").map(b => b.trim()).filter(Boolean);
      
      const { data, error } = await supabase
        .from("membership_levels")
        .insert({
          name: newLevel.name,
          min_monthly_points: newLevel.min_monthly_points || 0,
          min_active_direct_referrals: newLevel.min_active_direct_referrals || 0,
          min_purchases_per_month: newLevel.min_purchases_per_month || 0,
          min_active_referrals_per_month: newLevel.min_active_referrals_per_month || 0,
          min_team_points: newLevel.min_team_points || 0,
          min_downline_level: newLevel.min_downline_level || 0,
          min_downline_count: newLevel.min_downline_count || 0,
          min_consecutive_months: newLevel.min_consecutive_months || 0,
          requires_first_purchase: newLevel.requires_first_purchase || false,
          requires_profile_complete: newLevel.requires_profile_complete || false,
          requires_active_status: newLevel.requires_active_status || false,
          benefits: benefits,
          is_active: newLevel.is_active !== undefined ? newLevel.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;

      setLevels([...levels, data]);
      setShowAddForm(false);
      setNewLevel({
        name: "",
        min_monthly_points: 0,
        min_active_direct_referrals: 0,
        min_purchases_per_month: 0,
        min_active_referrals_per_month: 0,
        min_team_points: 0,
        min_downline_level: 0,
        min_downline_count: 0,
        min_consecutive_months: 0,
        requires_first_purchase: false,
        requires_profile_complete: false,
        requires_active_status: false,
        benefits: [],
        is_active: true,
      });
      setBenefitsInput("");
      showToast.success("Membership level added successfully");
    } catch (error) {
      console.error("Error adding membership level:", error);
      showToast.error("Failed to add membership level");
    }
  };

  const handleDeleteLevel = async (id: number) => {
    if (!confirm("Are you sure you want to delete this membership level?")) return;

    try {
      const { error } = await supabase
        .from("membership_levels")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setLevels(levels.filter(l => l.id !== id));
      showToast.success("Membership level deleted successfully");
    } catch (error) {
      console.error("Error deleting membership level:", error);
      showToast.error("Failed to delete membership level");
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedLevel(expandedLevel === id ? null : id);
  };

  const renderCriteriaBadge = (label: string, value: any, icon: React.ReactNode) => {
    return (
      <div className="flex items-center gap-1 rounded-full bg-slate-800/50 px-2 py-0.5 text-xs">
        {icon}
        <span className="text-slate-400">{label}:</span>
        <span className="font-medium text-white">{value}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading membership levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Membership Levels</h2>
          <p className="text-sm text-slate-400">Manage membership levels and promotion criteria</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Level
        </button>
      </div>

      {/* Add Form - Mobile Responsive */}
      {showAddForm && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <h3 className="text-sm font-semibold text-emerald-400 mb-4">Add New Level</h3>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-400">Level Name</label>
              <input
                type="text"
                value={newLevel.name}
                onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., Silver"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Min Monthly Points</label>
              <input
                type="number"
                value={newLevel.min_monthly_points}
                onChange={(e) => setNewLevel({ ...newLevel, min_monthly_points: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Min Direct Referrals</label>
              <input
                type="number"
                value={newLevel.min_active_direct_referrals}
                onChange={(e) => setNewLevel({ ...newLevel, min_active_direct_referrals: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Min Purchases/Month</label>
              <input
                type="number"
                value={newLevel.min_purchases_per_month}
                onChange={(e) => setNewLevel({ ...newLevel, min_purchases_per_month: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Min Team Points</label>
              <input
                type="number"
                value={newLevel.min_team_points}
                onChange={(e) => setNewLevel({ ...newLevel, min_team_points: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Benefits (comma separated)</label>
              <input
                type="text"
                value={benefitsInput}
                onChange={(e) => setBenefitsInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Benefit 1, Benefit 2"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-400">Min Downline Level</label>
              <input
                type="number"
                value={newLevel.min_downline_level}
                onChange={(e) => setNewLevel({ ...newLevel, min_downline_level: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Min Downline Count</label>
              <input
                type="number"
                value={newLevel.min_downline_count}
                onChange={(e) => setNewLevel({ ...newLevel, min_downline_count: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Consecutive Months</label>
              <input
                type="number"
                value={newLevel.min_consecutive_months}
                onChange={(e) => setNewLevel({ ...newLevel, min_consecutive_months: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={newLevel.requires_first_purchase}
                onChange={(e) => setNewLevel({ ...newLevel, requires_first_purchase: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              Requires First Purchase
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={newLevel.requires_profile_complete}
                onChange={(e) => setNewLevel({ ...newLevel, requires_profile_complete: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              Requires Profile Complete
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={newLevel.requires_active_status}
                onChange={(e) => setNewLevel({ ...newLevel, requires_active_status: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              Requires Active Status
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleAddLevel}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              Add Level
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewLevel({ name: "", min_monthly_points: 0, min_active_direct_referrals: 0, benefits: [], is_active: true });
                setBenefitsInput("");
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Levels List */}
      <div className="space-y-3">
        {levels.map((level) => {
          const isExpanded = expandedLevel === level.id;
          const colorClass = levelColors[level.id] || levelColors[1];
          const icon = levelIcons[level.id] || levelIcons[1];

          return (
            <div
              key={level.id}
              className={`rounded-xl border ${colorClass} p-3 md:p-4 transition-all ${
                isExpanded ? "shadow-lg shadow-emerald-500/5" : ""
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white text-sm md:text-base truncate">
                        Level {level.id}: {level.name}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0 ${
                        level.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {level.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {renderCriteriaBadge("Points", level.min_monthly_points, <Coins className="h-3 w-3" />)}
                      {renderCriteriaBadge("Referrals", level.min_active_direct_referrals, <Users className="h-3 w-3" />)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleExpand(level.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => router.push(`/admin/settings/membership-levels/${level.id}`)}
                    className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLevel(level.id)}
                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Content - Mobile Responsive */}
              {isExpanded && (
                <div className="mt-3 border-t border-slate-700/50 pt-3">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        Min Monthly Points
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_monthly_points.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Min Direct Referrals
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_active_direct_referrals}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        Min Purchases/Month
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_purchases_per_month}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        Min Active Referrals/Month
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_active_referrals_per_month}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Min Team Points
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_team_points.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />
                        Min Downline Count
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_downline_count}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Min Downline Level
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_downline_level}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Consecutive Months
                      </label>
                      <p className="text-sm font-medium text-white">{level.min_consecutive_months}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        Requirements
                      </label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {level.requires_first_purchase && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">First Purchase</span>
                        )}
                        {level.requires_profile_complete && (
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">Profile</span>
                        )}
                        {level.requires_active_status && (
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">Active</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs text-slate-400 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Benefits
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {level.benefits.map((benefit, index) => (
                        <span key={index} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {levels.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-slate-400">No membership levels created yet</p>
          <p className="text-sm text-slate-500">Click "Add Level" to create your first membership level</p>
        </div>
      )}
    </div>
  );
}