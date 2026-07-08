"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import SettingCard from "./SettingCard";

type Settings = {
  session_timeout: number;
  max_login_attempts: number;
  require_2fa: boolean;
  admin_only: boolean;
};

export default function SecuritySettings() {
  const [settings, setSettings] = useState<Settings>({
    session_timeout: 60,
    max_login_attempts: 5,
    require_2fa: false,
    admin_only: false,
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
        .select("session_timeout, max_login_attempts, require_2fa, admin_only")
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
        session_timeout: settings.session_timeout,
        max_login_attempts: settings.max_login_attempts,
        require_2fa: settings.require_2fa,
        admin_only: settings.admin_only,
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
    <SettingCard
      title="Security Settings"
      description="Session timeout, login attempts, and security features"
      onSave={handleSave}
      onRefresh={loadSettings}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-400">Session Timeout (minutes)</label>
            <input
              type="number"
              name="session_timeout"
              value={settings.session_timeout || 60}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Max Login Attempts</label>
            <input
              type="number"
              name="max_login_attempts"
              value={settings.max_login_attempts || 5}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="require_2fa"
              checked={settings.require_2fa || false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-white">Require Two-Factor Authentication</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="admin_only"
              checked={settings.admin_only || false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-white">Admin Only Mode</span>
          </label>
        </div>
      </div>
    </SettingCard>
  );
}