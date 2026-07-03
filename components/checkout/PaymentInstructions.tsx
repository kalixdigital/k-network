"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Copy, Check, AlertCircle } from "lucide-react";

type Props = {
  totalAmount?: number;
};

export default function PaymentInstructions({ totalAmount = 0 }: Props) {
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          showToast.error("Please login");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id_number")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setMemberId(data.id_number);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        showToast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const copyMemberId = async () => {
    try {
      await navigator.clipboard.writeText(memberId);
      setCopied(true);
      showToast.success("Member ID copied!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showToast.error("Failed to copy Member ID");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <h2 className="text-xl font-bold text-white">Payment Instructions</h2>

      {/* ⭐ Amount Alert */}
      {totalAmount > 0 && (
        <div className="mt-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">
                Transfer <span className="font-bold">₦{totalAmount.toLocaleString()}</span> exactly
              </p>
              <p className="text-xs text-yellow-400/70">
                Do not send more or less than this amount
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3 text-sm text-slate-300">
        <div className="flex items-start gap-3">
          <span className="text-emerald-400 font-bold">1.</span>
          <p>Transfer the exact amount of <strong className="text-emerald-400">₦{totalAmount.toLocaleString()}</strong> to the bank details below.</p>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-emerald-400 font-bold">2.</span>
          <p>Use your <strong className="text-white">Member ID</strong> as the transfer narration.</p>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-emerald-400 font-bold">3.</span>
          <p>Upload a clear screenshot or PDF of your payment receipt.</p>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-emerald-400 font-bold">4.</span>
          <p>Click <strong className="text-white">"Submit Order"</strong> to complete your order.</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">Transfer Narration</p>
            <p className="mt-1 font-mono text-xl font-bold text-emerald-400">
              {memberId || "N/A"}
            </p>
          </div>
          {memberId && (
            <button
              onClick={copyMemberId}
              className="rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/10"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/30 p-3">
        <p className="text-xs text-red-400 text-center">
          ⚠️ Orders without correct payment amount or narration will be rejected
        </p>
      </div>
    </div>
  );
}