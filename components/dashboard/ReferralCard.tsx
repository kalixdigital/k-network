"use client";

import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  memberId: string;
};

export default function ReferralCard({ memberId }: Props) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${memberId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join K-NETWORK",
        text: "Join K-NETWORK using my referral link.",
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

      <h2 className="text-xl font-bold text-white">
        Referral Center
      </h2>

      <p className="mt-2 text-slate-400">
        Invite people and grow your earnings.
      </p>

      <div className="mt-6 rounded-xl bg-slate-800 p-4">

        <p className="text-xs uppercase text-slate-400">
          Member ID
        </p>

        <h3 className="mt-1 text-lg font-bold text-emerald-400">
          {memberId}
        </h3>

      </div>

      <div className="mt-4 rounded-xl bg-slate-800 p-4 break-all">

        <p className="text-xs uppercase text-slate-400">
          Referral Link
        </p>

        <p className="mt-1 text-sm text-white">
          {referralLink}
        </p>

      </div>

      <div className="mt-6 flex gap-3">

        <button
          onClick={copyLink}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600"
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy
            </>
          )}
        </button>

        <button
          onClick={shareLink}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-800"
        >
          <Share2 size={18} />
          Share
        </button>

      </div>

    </div>
  );
}
