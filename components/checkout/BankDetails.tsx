"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type CompanySettings = {
  bank_name: string;
  account_name: string;
  account_number: string;
};

export default function BankDetails() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("company_settings")
        .select("bank_name,account_name,account_number")
        .eq("id", 1)
        .single();

      setSettings(data);
    };

    loadSettings();
  }, []);

  if (!settings) return null;

  const copyAccount = async () => {
    await navigator.clipboard.writeText(settings.account_number);
    alert("Account number copied.");
  };

  return (
    <div className="rounded-2xl bg-slate-900 p-6">

      <h2 className="text-xl font-bold text-white">
        Bank Details
      </h2>

      <div className="mt-5 space-y-3">

        <p className="text-slate-300">
          <strong>Bank:</strong> {settings.bank_name}
        </p>

        <p className="text-slate-300">
          <strong>Account Name:</strong> {settings.account_name}
        </p>

        <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

          <span className="text-lg font-bold text-white">
            {settings.account_number}
          </span>

          <button
            onClick={copyAccount}
            className="text-emerald-400"
          >
            <Copy size={20} />
          </button>

        </div>

      </div>

    </div>
  );
}
