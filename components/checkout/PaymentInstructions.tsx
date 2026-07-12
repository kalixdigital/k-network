"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Info, AlertCircle, Clock, CheckCircle, Copy, Check } from "lucide-react";
import { showToast } from "@/components/ui/toast";

type PaymentInstructionsProps = {
  totalAmount: number;
};

export default function PaymentInstructions({ totalAmount }: PaymentInstructionsProps) {
  const [memberId, setMemberId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadMemberId();
  }, []);

  const loadMemberId = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id_number")
        .eq("id", user.id)
        .single();

      if (profile) {
        setMemberId(profile.id_number || "");
      }
    } catch (error) {
      console.error("Error loading member ID:", error);
    }
  };

  const copyMemberId = async () => {
    if (!memberId) {
      showToast.error("No member ID available");
      return;
    }

    try {
      await navigator.clipboard.writeText(memberId);
      setCopied(true);
      showToast.success("Member ID copied! Use this as your transaction narration.");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      showToast.error("Failed to copy member ID");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Payment Instructions</h2>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Amount to Pay</p>
              <p className="text-2xl font-bold text-emerald-400">
                ₦{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Member ID - Copy Section */}
        {memberId && (
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-yellow-400/80 flex items-center gap-1"> Use this as your transaction narration
                </p>
                <p className="font-mono text-sm font-bold text-yellow-400 truncate mt-0.5">
                  {memberId}
                </p>
              </div>
              <button
                onClick={copyMemberId}
                className="flex-shrink-0 rounded-lg bg-yellow-500/20 px-3 py-2 text-xs font-medium text-yellow-400 transition hover:bg-yellow-500/30 active:scale-95"
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
              1
            </div>
            <div>
              <p className="text-sm text-white">Transfer the exact amount to the bank account above</p>
              <p className="text-xs text-slate-400">Ensure you transfer the exact amount for faster confirmation</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
              2
            </div>
            <div>
              <p className="text-sm text-white">Use your Member ID as transaction narration</p>
              <p className="text-xs text-slate-400">This helps us identify your payment quickly</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
              3
            </div>
            <div>
              <p className="text-sm text-white">Upload your payment receipt</p>
              <p className="text-xs text-slate-400">Take a screenshot or photo of your transaction</p>
            </div>
          </div>
        </div>

        {/* Payment Reminder */}
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
          <p className="text-xs text-amber-400/80 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Payment confirmation may take up to 24 hours. You'll receive a notification once confirmed.</span>
          </p>
        </div>
      </div>
    </div>
  );
}