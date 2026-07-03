"use client";

import { Copy, Share2, Check, Gift } from "lucide-react";
import { useState } from "react";
import { showToast } from "@/components/ui/toast";

type Props = {
  memberId: string;
};

export default function ReferralCard({ memberId }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${memberId}`
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      showToast.error("Failed to copy link");
    }
  };

  const shareLink = async () => {
    if (typeof window === "undefined") return;

    setShareLoading(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join K-NETWORK",
          text: "Join K-NETWORK using my referral link and start earning!",
          url: referralLink,
        });
      } else {
        await copyLink();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        showToast.error("Failed to share link");
      }
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Referral Center</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Invite friends and earn rewards
          </p>
        </div>
        <div className="flex-shrink-0 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
          Active
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="w-full min-w-0 overflow-hidden rounded-xl bg-slate-800/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Member ID
          </p>
          <p className="mt-1 w-full truncate font-mono text-lg font-bold text-emerald-400">
            {memberId}
          </p>
        </div>

        <div className="w-full min-w-0 overflow-hidden rounded-xl bg-slate-800/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Referral Link
          </p>
          <p className="mt-1 w-full truncate text-sm text-white">
            {referralLink}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={copyLink}
          className="flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Link
            </>
          )}
        </button>

        <button
          onClick={shareLink}
          disabled={shareLoading}
          className="flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
        >
          {shareLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Share2 size={18} />
              Share
            </>
          )}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-emerald-500/10 p-3">
        <p className="text-center text-xs text-emerald-400">
          💰 Earn rewards for every successful referral!
        </p>
      </div>
    </div>
  );
}