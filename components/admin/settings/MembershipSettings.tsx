"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import SettingCard from "./SettingCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Settings = {
  enable_membership: boolean;
  membership_upgrade_auto: boolean;
  membership_grace_period: number;
};

export default function MembershipSettings() {
  const [settings, setSettings] = useState<Settings>({
    enable_membership: true,
    membership_upgrade_auto: true,
    membership_grace_period: 30,
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
        .select("enable_membership, membership_upgrade_auto, membership_grace_period")
        .eq("id", 1)
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseFloat(value) || 0,
    }));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("company_settings")
      .update({
        enable_membership: settings.enable_membership,
        membership_upgrade_auto: settings.membership_upgrade_auto,
        membership_grace_period: settings.membership_grace_period,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) throw error;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingCard
        title="Membership Settings"
        description="Configure membership system behavior"
        onSave={handleSave}
        onRefresh={loadSettings}
      >
        <div className="space-y-4">
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
            <p className="text-sm text-purple-400">
              💡 Manage membership levels in the{" "}
              <Link
                href="/admin/settings/membership-levels"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Membership Levels Manager
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="enable_membership"
                checked={settings.enable_membership || false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm text-white">Enable Membership System</span>
                <p className="text-xs text-slate-400">Allow members to earn points and level up</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="membership_upgrade_auto"
                checked={settings.membership_upgrade_auto || false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm text-white">Automatic Upgrades</span>
                <p className="text-xs text-slate-400">Automatically upgrade members when they qualify</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Grace Period (days)
              </label>
              <input
                type="number"
                name="membership_grace_period"
                value={settings.membership_grace_period || 30}
                onChange={handleChange}
                min="0"
                max="365"
                className="mt-1 w-full max-w-[200px] rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Days after the month ends before members lose their level status
              </p>
            </div>
          </div>
        </div>
      </SettingCard>
    </div>
  );
}