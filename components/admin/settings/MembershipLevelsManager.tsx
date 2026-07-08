"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

type MembershipLevel = {
  id: number;
  name: string;
  min_monthly_points: number;
  min_active_direct_referrals: number;
  benefits: string[];
  is_active: boolean;
};

export default function MembershipLevelsManager() {
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [benefitsInput, setBenefitsInput] = useState("");
  const [newLevel, setNewLevel] = useState<Partial<MembershipLevel>>({
    name: "",
    min_monthly_points: 0,
    min_active_direct_referrals: 0,
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
      const { data, error } = await supabase
        .from("membership_levels")
        .insert({
          name: newLevel.name,
          min_monthly_points: newLevel.min_monthly_points || 0,
          min_active_direct_referrals: newLevel.min_active_direct_referrals || 0,
          benefits: newLevel.benefits || [],
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

  const handleUpdateLevel = async (id: number) => {
    const level = levels.find(l => l.id === id);
    if (!level) return;

    try {
      const { error } = await supabase
        .from("membership_levels")
        .update({
          name: level.name,
          min_monthly_points: level.min_monthly_points,
          min_active_direct_referrals: level.min_active_direct_referrals,
          benefits: level.benefits,
          is_active: level.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setEditingId(null);
      showToast.success("Membership level updated successfully");
    } catch (error) {
      console.error("Error updating membership level:", error);
      showToast.error("Failed to update membership level");
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

  const handleBenefitsChange = (level: MembershipLevel, value: string) => {
    const benefits = value.split(",").map(b => b.trim()).filter(Boolean);
    const updatedLevel = { ...level, benefits };
    setLevels(levels.map(l => l.id === level.id ? updatedLevel : l));
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Membership Levels</h2>
          <p className="text-sm text-slate-400">Manage membership levels and requirements</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Level
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <h3 className="text-sm font-semibold text-emerald-400 mb-4">Add New Level</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <label className="block text-sm font-medium text-slate-400">Min Active Direct Referrals</label>
              <input
                type="number"
                value={newLevel.min_active_direct_referrals}
                onChange={(e) => setNewLevel({ ...newLevel, min_active_direct_referrals: parseInt(e.target.value) || 0 })}
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
          <div className="mt-4 flex gap-3">
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

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Level</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Min Points</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Min Active Referrals</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Benefits</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id} className="border-b border-slate-800/50">
                <td className="px-4 py-3">
                  {editingId === level.id ? (
                    <input
                      type="text"
                      value={level.name}
                      onChange={(e) => setLevels(levels.map(l => l.id === level.id ? { ...l, name: e.target.value } : l))}
                      className="rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <span className="font-semibold text-white">Level {level.id}: {level.name}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === level.id ? (
                    <input
                      type="number"
                      value={level.min_monthly_points}
                      onChange={(e) => setLevels(levels.map(l => l.id === level.id ? { ...l, min_monthly_points: parseInt(e.target.value) || 0 } : l))}
                      className="w-24 rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <span className="text-white">{level.min_monthly_points.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === level.id ? (
                    <input
                      type="number"
                      value={level.min_active_direct_referrals}
                      onChange={(e) => setLevels(levels.map(l => l.id === level.id ? { ...l, min_active_direct_referrals: parseInt(e.target.value) || 0 } : l))}
                      className="w-20 rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <span className="text-white">{level.min_active_direct_referrals}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === level.id ? (
                    <input
                      type="text"
                      value={level.benefits.join(", ")}
                      onChange={(e) => handleBenefitsChange(level, e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm text-slate-300 truncate block max-w-[150px]">
                      {level.benefits.join(", ")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === level.id ? (
                    <select
                      value={level.is_active ? "true" : "false"}
                      onChange={(e) => setLevels(levels.map(l => l.id === level.id ? { ...l, is_active: e.target.value === "true" } : l))}
                      className="rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      level.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {level.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === level.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateLevel(level.id)}
                        className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(level.id)}
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}