"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Banknote, Building, User } from "lucide-react";

export default function BankDetails() {
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_settings")
        .select("bank_name, account_name, account_number")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Error loading bank details:", error);
        return;
      }

      if (data) {
        setBankDetails({
          bank_name: data.bank_name || "GTBank",
          account_name: data.account_name || "K-NETWORK Limited",
          account_number: data.account_number || "0123456789",
        });
      }
    } catch (error) {
      console.error("Error loading bank details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Banknote className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Bank Details</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg bg-slate-800/30 p-3">
          <Building className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-xs text-slate-400">Bank Name</p>
            <p className="font-medium text-white">{bankDetails.bank_name}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-slate-800/30 p-3">
          <User className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-xs text-slate-400">Account Name</p>
            <p className="font-medium text-white">{bankDetails.account_name}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-slate-800/30 p-3">
          <Banknote className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-xs text-slate-400">Account Number</p>
            <p className="font-mono font-medium text-white">{bankDetails.account_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}