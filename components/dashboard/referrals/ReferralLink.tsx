"use client";

import { Copy, Share2, Check, Gift, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { showToast } from "@/components/ui/toast";

type ReferralLinkProps = {
  memberId: string;
};

export default function ReferralLink({ memberId }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  // Generate referral link on client side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      setReferralLink(`${window.location.origin}/register?ref=${memberId}`);
    }
  }, [memberId]);

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
          text: "Join K-NETWORK using my referral link and start earning rewards!",
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
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-400" />
            Your Referral Link
          </h2>
          <p className="text-sm text-slate-400">Share your link and earn rewards for every successful referral</p>
        </div>
        <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 flex items-center gap-1 self-start sm:self-center">
          <Users className="h-3 w-3" />
          Active
        </div>
      </div>

      <div className="rounded-xl bg-slate-800/50 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0 w-full">
            <p className="text-xs text-slate-400 mb-1">Share this link with friends:</p>
            <p className="font-mono text-sm text-white truncate">
              {referralLink || "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyLink}
              disabled={!referralLink}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={shareLink}
              disabled={shareLoading || !referralLink}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {shareLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-emerald-500/5 p-3 text-center">
        <p className="text-xs text-emerald-400 flex items-center justify-center gap-1">
          <Gift className="h-3 w-3" />
          You earn referral bonuses when your referrals make their first purchase!
        </p>
      </div>
    </div>
  );
}