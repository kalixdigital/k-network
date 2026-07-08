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
  
  // Payment Settings
  bank_name: string;
  account_name: string;
  account_number: string;
  payment_methods: string[];
  min_withdrawal: number;
  max_withdrawal: number;
  withdrawal_fee: number;
  
  // Points Settings
  points_rate: number;
  points_per_purchase: number;
  direct_referral_bonus: number;
  indirect_referral_bonus: number;
  max_direct_referrals: number;
  monthly_reset_day: number;
  
  // Membership Settings
  membership_levels: any;
  
  // Security Settings
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
        [name]: value === '' ? 0 : parseFloat(value) || 0,
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
      // ✅ Prepare the data for saving - ensure proper formatting
      const saveData = {
        site_name: settings.site_name || "K-NETWORK",
        site_description: settings.site_description || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        address: settings.address || "",
        
        // Payment Settings
        bank_name: settings.bank_name || "",
        account_name: settings.account_name || "",
        account_number: settings.account_number || "",
        payment_methods: settings.payment_methods || ["bank_transfer"],
        min_withdrawal: settings.min_withdrawal ?? 5000,
        max_withdrawal: settings.max_withdrawal ?? 500000,
        withdrawal_fee: settings.withdrawal_fee ?? 0,
        
        // Points Settings
        points_rate: settings.points_rate ?? 10,
        points_per_purchase: settings.points_per_purchase ?? 1,
        direct_referral_bonus: settings.direct_referral_bonus ?? 10,
        indirect_referral_bonus: settings.indirect_referral_bonus ?? 10,
        max_direct_referrals: settings.max_direct_referrals ?? 20,
        monthly_reset_day: settings.monthly_reset_day ?? 23,
        
        // Membership Settings - ensure it's valid JSON
        membership_levels: settings.membership_levels || [
          { "level": 1, "min_monthly_points": 100, "min_active_direct_referrals": 0, "benefits": ["Basic access"] },
          { "level": 2, "min_monthly_points": 500, "min_active_direct_referrals": 2, "benefits": ["Priority support"] },
          { "level": 3, "min_monthly_points": 1500, "min_active_direct_referrals": 5, "benefits": ["VIP support"] },
          { "level": 4, "min_monthly_points": 5000, "min_active_direct_referrals": 10, "benefits": ["Premium support"] },
          { "level": 5, "min_monthly_points": 15000, "min_active_direct_referrals": 20, "benefits": ["Elite status"] }
        ],
        
        // Security Settings
        session_timeout: settings.session_timeout ?? 60,
        max_login_attempts: settings.max_login_attempts ?? 5,
        require_2fa: settings.require_2fa || false,
        admin_only: settings.admin_only || false,
        
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("company_settings")
        .update(saveData)
        .eq("id", 1);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

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
          value={settings.site_name || ""}
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
          value={settings.site_description || ""}
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
      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            Minimum Withdrawal (₦)
          </label>
          <input
            type="number"
            name="min_withdrawal"
            value={settings.min_withdrawal ?? 5000}
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
            value={settings.max_withdrawal ?? 500000}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Withdrawal Fee (₦)
          </label>
          <input
            type="number"
            name="withdrawal_fee"
            value={settings.withdrawal_fee ?? 0}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
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
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-emerald-400">Points Engine Configuration</h3>
        <p className="text-xs text-slate-400 mt-1">
          These settings control how points are calculated and awarded in the system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            Points Rate (₦ per point)
          </label>
          <input
            type="number"
            name="points_rate"
            value={settings.points_rate ?? 10}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Each point is worth ₦{settings.points_rate ?? 10}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Points Per Purchase (₦)
          </label>
          <input
            type="number"
            name="points_per_purchase"
            value={settings.points_per_purchase ?? 1}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            1 point per ₦{settings.points_per_purchase ?? 1} spent
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <h4 className="text-sm font-semibold text-white mb-4">Referral Bonuses</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-400">
              Direct Referral Bonus (points)
            </label>
            <input
              type="number"
              name="direct_referral_bonus"
              value={settings.direct_referral_bonus ?? 10}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              Points awarded to direct sponsor
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">
              Indirect Referral Bonus (points)
            </label>
            <input
              type="number"
              name="indirect_referral_bonus"
              value={settings.indirect_referral_bonus ?? 10}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              Points awarded to indirect sponsor (sponsor of direct sponsor)
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <h4 className="text-sm font-semibold text-white mb-4">Referral Limits</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-400">
              Max Direct Referrals
            </label>
            <input
              type="number"
              name="max_direct_referrals"
              value={settings.max_direct_referrals ?? 20}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              Maximum number of direct referrals allowed per member
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">
              Monthly Reset Day
            </label>
            <input
              type="number"
              name="monthly_reset_day"
              value={settings.monthly_reset_day ?? 23}
              onChange={handleNumberChange}
              min="1"
              max="28"
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              Day of the month when monthly statistics reset (1-28)
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembershipSettings = () => (
    <div className="space-y-6">
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-purple-400">Membership Levels</h3>
        <p className="text-xs text-slate-400 mt-1">
          Configure membership levels, requirements, and benefits.
        </p>
      </div>

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
          rows={12}
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Edit the JSON to modify membership levels, requirements, and benefits.
          <br />
          Format: {"{"}"level": 1, "min_monthly_points": 100, "min_active_direct_referrals": 0, "benefits": ["Benefit 1"]{"}"}
        </p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            name="session_timeout"
            value={settings.session_timeout ?? 60}
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
            value={settings.max_login_attempts ?? 5}
            onChange={handleNumberChange}
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">
            {section} Settings
          </h2>
          {section === "points" && (
            <p className="text-sm text-slate-400">
              Configure the Points & Membership Engine
            </p>
          )}
        </div>
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