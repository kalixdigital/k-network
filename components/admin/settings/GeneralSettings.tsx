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
  site_logo: string | null;
};

export default function GeneralSettings() {
  const [settings, setSettings] = useState<Settings>({
    site_name: "K-NETWORK",
    site_description: "Network Marketing & E-commerce Platform",
    contact_email: "",
    contact_phone: "",
    address: "",
    site_logo: null,
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
        .select("site_name, site_description, contact_email, contact_phone, address, site_logo")
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
          site_logo: null,
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
          site_logo: data.site_logo || null,
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

  const handleSave = async (): Promise<void> => {
    try {
      const updateData = {
        site_name: settings.site_name,
        site_description: settings.site_description,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        address: settings.address,
        site_logo: settings.site_logo,
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
      description="Configure your site name, contact information, and logo"
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
            <label className="block text-sm font-medium text-slate-400">Site Logo URL</label>
            <input
              type="text"
              name="site_logo"
              value={settings.site_logo || ""}
              onChange={handleChange}
              placeholder="https://your-bucket.supabase.co/logo.png"
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              Enter the public URL of your logo from Supabase Storage
            </p>
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
      </div>
    </SettingCard>
  );
}