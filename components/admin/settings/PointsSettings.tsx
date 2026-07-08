"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import SettingCard from "./SettingCard";

type Settings = {
  points_rate: number;
  direct_referral_percentage: number;
  indirect_referral_percentage: number;
  max_direct_referrals: number;
  monthly_reset_day: number;
};

export default function PointsSettings() {
  const [settings, setSettings] = useState<Settings>({
    points_rate: 10,
    direct_referral_percentage: 10,
    indirect_referral_percentage: 5,
    max_direct_referrals: 20,
    monthly_reset_day: 23,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_settings")
        .select(
          "points_rate, direct_referral_percentage, indirect_referral_percentage, max_direct_referrals, monthly_reset_day"
        )
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Error loading points settings:", error);
        setSettings({
          points_rate: 10,
          direct_referral_percentage: 10,
          indirect_referral_percentage: 5,
          max_direct_referrals: 20,
          monthly_reset_day: 23,
        });
        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          points_rate: data.points_rate ?? 10,
          direct_referral_percentage: data.direct_referral_percentage ?? 10,
          indirect_referral_percentage: data.indirect_referral_percentage ?? 5,
          max_direct_referrals: data.max_direct_referrals ?? 20,
          monthly_reset_day: data.monthly_reset_day ?? 23,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    setSettings((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleSave = async () => {
    try {
      console.log("Saving points settings:", settings);

      const updateData = {
        points_rate: settings.points_rate || 10,
        direct_referral_percentage: settings.direct_referral_percentage || 10,
        indirect_referral_percentage: settings.indirect_referral_percentage || 5,
        max_direct_referrals: settings.max_direct_referrals || 20,
        monthly_reset_day: settings.monthly_reset_day || 23,
        updated_at: new Date().toISOString(),
      };

      console.log("Sending to Supabase:", updateData);

      const { data, error } = await supabase
        .from("company_settings")
        .update(updateData)
        .eq("id", 1)
        .select();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log("Update successful:", data);
      showToast.success("Points settings saved successfully!");
    } catch (error: any) {
      console.error("Error in handleSave:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        fullError: error,
      });
      showToast.error(`Failed to save settings: ${error?.message || "Unknown error"}`);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <SettingCard
      title="Points Settings"
      description="Configure points rate, referral bonuses, and limits"
      onSave={handleSave}
      onRefresh={loadSettings}
    >
      <div className="space-y-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-sm text-emerald-400">⚠️ These settings affect the entire platform. Changes will apply to all future transactions.</p>
        </div>

        {/* Points Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-400">Points Rate (₦ per point)</label>
          <input
            type="number"
            name="points_rate"
            value={settings.points_rate ?? 10}
            onChange={handleNumberChange}
            min="1"
            step="0.5"
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Each point is worth ₦{settings.points_rate ?? 10} when calculating earnings
          </p>
        </div>

        {/* Referral Bonuses - Using Percentages */}
        <div className="border-t border-slate-800 pt-4">
          <h4 className="text-sm font-semibold text-white mb-4">Referral Bonuses (% of Product Points)</h4>
          <div className="bg-slate-800/30 rounded-lg p-4 mb-4">
            <p className="text-xs text-slate-400">
              💡 Referral bonuses are calculated as a percentage of the product points earned from each purchase.
              <br />
              Example: If a product gives 100 points and direct referral is set to 10%, the referrer gets 10 points.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400">Direct Referral Bonus (%)</label>
              <input
                type="number"
                name="direct_referral_percentage"
                value={settings.direct_referral_percentage ?? 10}
                onChange={handleNumberChange}
                min="0"
                max="100"
                step="1"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                {settings.direct_referral_percentage ?? 10}% of product points awarded to direct sponsor
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">Indirect Referral Bonus (%)</label>
              <input
                type="number"
                name="indirect_referral_percentage"
                value={settings.indirect_referral_percentage ?? 5}
                onChange={handleNumberChange}
                min="0"
                max="100"
                step="1"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                {settings.indirect_referral_percentage ?? 5}% of product points awarded to indirect sponsor
              </p>
            </div>
          </div>
        </div>

        {/* Referral Limits */}
        <div className="border-t border-slate-800 pt-4">
          <h4 className="text-sm font-semibold text-white mb-4">Referral Limits</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400">Max Direct Referrals</label>
              <input
                type="number"
                name="max_direct_referrals"
                value={settings.max_direct_referrals ?? 20}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Maximum number of direct referrals allowed per member</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">Monthly Reset Day</label>
              <input
                type="number"
                name="monthly_reset_day"
                value={settings.monthly_reset_day ?? 23}
                onChange={handleNumberChange}
                min="1"
                max="28"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Day of the month when monthly statistics reset (1-28)</p>
            </div>
          </div>
        </div>
      </div>
    </SettingCard>
  );
}