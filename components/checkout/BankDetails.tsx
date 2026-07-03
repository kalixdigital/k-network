"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

type CompanySettings = {
  bank_name: string;
  account_name: string;
  account_number: string;
};

export default function BankDetails() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("company_settings")
          .select("bank_name, account_name, account_number")
          .eq("id", 1)
          .single();

        if (error) throw error;
        setSettings(data);
      } catch (error) {
        console.error("Error loading bank details:", error);
        showToast.error("Failed to load bank details");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const copyAccount = async () => {
    if (!settings) return;
    
    try {
      await navigator.clipboard.writeText(settings.account_number);
      setCopied(true);
      showToast.success("Account number copied!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showToast.error("Failed to copy account number");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-2xl bg-slate-900/50 p-6 text-center">
        <p className="text-slate-400">Bank details not configured</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <h2 className="text-xl font-bold text-white">Bank Details</h2>

      <div className="mt-5 space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">Bank</p>
          <p className="text-lg font-semibold text-white">{settings.bank_name}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-slate-400">Account Name</p>
          <p className="text-lg font-semibold text-white">{settings.account_name}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-slate-400">Account Number</p>
          <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
            <span className="text-xl font-bold text-white tracking-wider">
              {settings.account_number}
            </span>
            <button
              onClick={copyAccount}
              className="rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}