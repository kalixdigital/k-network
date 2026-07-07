"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Save, RefreshCw } from "lucide-react";

type CompanySettings = {
  id: number;
  site_name: string;
  site_logo: string | null;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  payment_methods: string[];
  min_withdrawal: number;
  max_withdrawal: number;
  withdrawal_fee: number;
  points_rate: number;
  points_per_purchase: number;
  direct_referral_points: number;
  indirect_referral_points: number;
  level_bonus_points: number;
  membership_levels: any;
  session_timeout: number;
  max_login_attempts: number;
  require_2fa: boolean;
  admin_only: boolean;
};

type Props = {
  section: "general" | "payment" | "points" | "membership" | "security";
};

export default function SettingsForm({ section }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: parseFloat(value) || 0,
      };
    });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split(",").filter(Boolean);
    setSettings((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: arrayValue,
      };
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("company_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw error;

      showToast.success("Settings saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Settings not found</p>
        <button
          onClick={loadSettings}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400">
          Site Name
        </label>
        <input
          type="text"
          name="site_name"
          value={settings.site_name}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Site Description
        </label>
        <textarea
          name="site_description"
          value={settings.site_description}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            Contact Email
          </label>
          <input
            type="email"
            name="contact_email"
            value={settings.contact_email || ""}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Contact Phone
          </label>
          <input
            type="text"
            name="contact_phone"
            value={settings.contact_phone || ""}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Address
        </label>
        <textarea
          name="address"
          value={settings.address || ""}
          onChange={handleChange}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400">
          Bank Name
        </label>
        <input
          type="text"
          name="bank_name"
          value={settings.bank_name || ""}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Account Name
        </label>
        <input
          type="text"
          name="account_name"
          value={settings.account_name || ""}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Account Number
        </label>
        <input
          type="text"
          name="account_number"
          value={settings.account_number || ""}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            Minimum Withdrawal (₦)
          </label>
          <input
            type="number"
            name="min_withdrawal"
            value={settings.min_withdrawal}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Maximum Withdrawal (₦)
          </label>
          <input
            type="number"
            name="max_withdrawal"
            value={settings.max_withdrawal}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Withdrawal Fee (₦)
        </label>
        <input
          type="number"
          name="withdrawal_fee"
          value={settings.withdrawal_fee}
          onChange={handleNumberChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Payment Methods
        </label>
        <select
          name="payment_methods"
          value={settings.payment_methods?.join(",") || ""}
          onChange={handleArrayChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="bank_transfer,mobile_money">Bank Transfer + Mobile Money</option>
          <option value="bank_transfer,mobile_money,crypto">All Methods</option>
        </select>
      </div>
    </div>
  );

  const renderPointsSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400">
          Points Rate (₦ per point)
        </label>
        <input
          type="number"
          name="points_rate"
          value={settings.points_rate}
          onChange={handleNumberChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Each point is worth ₦{settings.points_rate}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Points Per Purchase (₦)
        </label>
        <input
          type="number"
          name="points_per_purchase"
          value={settings.points_per_purchase}
          onChange={handleNumberChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          1 point per ₦{settings.points_per_purchase} spent
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            Direct Referral Points
          </label>
          <input
            type="number"
            name="direct_referral_points"
            value={settings.direct_referral_points}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Indirect Referral Points
          </label>
          <input
            type="number"
            name="indirect_referral_points"
            value={settings.indirect_referral_points}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Level Bonus Points
          </label>
          <input
            type="number"
            name="level_bonus_points"
            value={settings.level_bonus_points}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  const renderMembershipSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400">
          Membership Levels (JSON)
        </label>
        <textarea
          name="membership_levels"
          value={JSON.stringify(settings.membership_levels, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setSettings((prev) => {
                if (!prev) return null;
                return { ...prev, membership_levels: parsed };
              });
            } catch (error) {
              // Invalid JSON, ignore
            }
          }}
          rows={10}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Edit the JSON to modify membership levels, requirements, and benefits
        </p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          name="session_timeout"
          value={settings.session_timeout}
          onChange={handleNumberChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400">
          Max Login Attempts
        </label>
        <input
          type="number"
          name="max_login_attempts"
          value={settings.max_login_attempts}
          onChange={handleNumberChange}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="require_2fa"
            checked={settings.require_2fa}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-white">Require Two-Factor Authentication</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="admin_only"
            checked={settings.admin_only}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-white">Admin Only Mode</span>
        </label>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "general":
        return renderGeneralSettings();
      case "payment":
        return renderPaymentSettings();
      case "points":
        return renderPointsSettings();
      case "membership":
        return renderMembershipSettings();
      case "security":
        return renderSecuritySettings();
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white capitalize">
          {section} Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {renderSection()}
    </div>
  );
}