"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import SettingCard from "./SettingCard";

type Settings = {
  bank_name: string;
  account_name: string;
  account_number: string;
  payment_methods: string[];
  min_withdrawal: number;
  max_withdrawal: number;
  withdrawal_fee: number;
};

export default function PaymentSettings() {
  const [settings, setSettings] = useState<Settings>({
    bank_name: "",
    account_name: "",
    account_number: "",
    payment_methods: ["bank_transfer"],
    min_withdrawal: 5000,
    max_withdrawal: 500000,
    withdrawal_fee: 0,
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
        .select("bank_name, account_name, account_number, payment_methods, min_withdrawal, max_withdrawal, withdrawal_fee")
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const arrayValue = value.split(",").filter(Boolean);
    setSettings((prev) => ({ ...prev, payment_methods: arrayValue }));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("company_settings")
      .update({
        bank_name: settings.bank_name,
        account_name: settings.account_name,
        account_number: settings.account_number,
        payment_methods: settings.payment_methods,
        min_withdrawal: settings.min_withdrawal,
        max_withdrawal: settings.max_withdrawal,
        withdrawal_fee: settings.withdrawal_fee,
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
      title="Payment Settings"
      description="Bank details, withdrawal limits, and payment methods"
      onSave={handleSave}
      onRefresh={loadSettings}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-400">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              value={settings.bank_name || ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Account Name</label>
            <input
              type="text"
              name="account_name"
              value={settings.account_name || ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Account Number</label>
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
            <label className="block text-sm font-medium text-slate-400">Minimum Withdrawal (₦)</label>
            <input
              type="number"
              name="min_withdrawal"
              value={settings.min_withdrawal || 5000}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Maximum Withdrawal (₦)</label>
            <input
              type="number"
              name="max_withdrawal"
              value={settings.max_withdrawal || 500000}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Withdrawal Fee (₦)</label>
            <input
              type="number"
              name="withdrawal_fee"
              value={settings.withdrawal_fee || 0}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">Payment Methods</label>
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
    </SettingCard>
  );
}