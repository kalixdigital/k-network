"use client";

import { Copy, Share2, Check, Gift } from "lucide-react";
import { useState } from "react";
import { showToast } from "@/components/ui/toast";
import { getLevel } from "@/lib/constants/levels";

type Props = {
  memberId: string;
  level?: number; // Optional level for color theming
};

export default function ReferralCard({ memberId, level = 1 }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const levelData = getLevel(level);

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
    <div className="w-full overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-800/50 p-4 shadow-xl backdrop-blur md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-500/20 p-1.5">
            <Gift className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Referral Center</h2>
            <p className="text-[10px] text-slate-400">Invite friends & earn rewards</p>
          </div>
        </div>
        <div className={`rounded-full ${levelData.badgeBg} px-2 py-0.5 text-[10px] font-medium ${levelData.badgeText}`}>
          Active
        </div>
      </div>

      {/* Member ID */}
      <div className="mt-3 rounded-xl bg-slate-800/50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Your Member ID
            </p>
            <p className={`mt-0.5 font-mono text-sm font-bold ${levelData.textColor}`}>
              {memberId}
            </p>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mt-2 rounded-xl bg-slate-800/50 p-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">
          Your Referral Link
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="flex-1 truncate font-mono text-xs text-white">
            {referralLink}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={copyLink}
          className={`flex items-center justify-center gap-2 rounded-xl ${levelData.bgColor} py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </button>

        <button
          onClick={shareLink}
          disabled={shareLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
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

      {/* Footer */}
      <div className={`mt-3 rounded-xl ${levelData.badgeBg} p-2 text-center`}>
        <p className={`text-[10px] ${levelData.textColor} flex items-center justify-center gap-1`}>
          <Gift className="h-3 w-3" />
          Earn rewards for every successful referral!
        </p>
      </div>
    </div>
  );
}