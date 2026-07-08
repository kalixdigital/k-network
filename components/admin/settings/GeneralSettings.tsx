"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import SettingCard from "./SettingCard";

type Settings = {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  timezone: string;
};

export default function GeneralSettings() {
  const [settings, setSettings] = useState<Settings>({
    site_name: "K-NETWORK",
    site_description: "Network Marketing & E-commerce Platform",
    contact_email: "",
    contact_phone: "",
    address: "",
    currency: "₦",
    timezone: "Africa/Lagos",
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
        .select("site_name, site_description, contact_email, contact_phone, address, currency, timezone")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Error loading general settings:", error);
        setSettings({
          site_name: "K-NETWORK",
          site_description: "Network Marketing & E-commerce Platform",
          contact_email: "",
          contact_phone: "",
          address: "",
          currency: "₦",
          timezone: "Africa/Lagos",
        });
        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          site_name: data.site_name || "K-NETWORK",
          site_description: data.site_description || "Network Marketing & E-commerce Platform",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          address: data.address || "",
          currency: data.currency || "₦",
          timezone: data.timezone || "Africa/Lagos",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updateData = {
        site_name: settings.site_name,
        site_description: settings.site_description,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        address: settings.address,
        currency: settings.currency,
        timezone: settings.timezone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("company_settings")
        .update(updateData)
        .eq("id", 1);

      if (error) throw error;

      showToast.success("General settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
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
      title="General Settings"
      description="Configure your site name, contact information, and regional settings"
      onSave={handleSave}
      onRefresh={loadSettings}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-400">Site Name</label>
            <input
              type="text"
              name="site_name"
              value={settings.site_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Currency</label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="₦">₦ (Naira)</option>
              <option value="$">$ (Dollar)</option>
              <option value="€">€ (Euro)</option>
              <option value="£">£ (Pound)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">Site Description</label>
          <textarea
            name="site_description"
            value={settings.site_description}
            onChange={handleChange}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-400">Contact Email</label>
            <input
              type="email"
              name="contact_email"
              value={settings.contact_email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Contact Phone</label>
            <input
              type="text"
              name="contact_phone"
              value={settings.contact_phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">Address</label>
          <input
            type="text"
            name="address"
            value={settings.address}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">Timezone</label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
            <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
            <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
            <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
            <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
            <option value="Australia/Sydney">Australia/Sydney (UTC+11)</option>
          </select>
        </div>
      </div>
    </SettingCard>
  );
}