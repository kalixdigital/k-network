"use client";

import { useState } from "react";
import { 
  User, 
  Calendar, 
  Award, 
  CheckCircle, 
  Clock, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Users
} from "lucide-react";
import { getLevel, getLevelName } from "@/lib/constants/levels";

type Referral = {
  id: string;
  full_name: string;
  id_number: string;
  email: string;
  membership_level: number;
  is_active: boolean;
  created_at: string;
  first_purchase_date: string | null;
};

type ReferralTableProps = {
  referrals: Referral[];
  loading: boolean;
};

// Level icons mapping for display
const levelIcons: Record<number, string> = {
  1: "🌟",
  2: "🥉",
  3: "🥈",
  4: "🥇",
  5: "💎",
  6: "👑",
};

export default function ReferralTable({ referrals, loading }: ReferralTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Referral>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent mx-auto" />
          <p className="text-slate-400 mt-4">Loading referrals...</p>
        </div>
      </div>
    );
  }

  // Filter referrals
  const filteredReferrals = referrals.filter((referral) => {
    const search = searchTerm.toLowerCase();
    return (
      referral.full_name?.toLowerCase().includes(search) ||
      referral.id_number?.toLowerCase().includes(search) ||
      referral.email?.toLowerCase().includes(search)
    );
  });

  // Sort referrals
  const sortedReferrals = [...filteredReferrals].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: keyof Referral) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Referral List</h2>
          <p className="text-sm text-slate-400">
            Showing {filteredReferrals.length} of {referrals.length} referrals
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {referrals.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-600 mx-auto" />
          <p className="mt-4 text-slate-400">No referrals yet</p>
          <p className="text-sm text-slate-500">Share your referral link to start building your team</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("full_name")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Referral
                    {sortField === "full_name" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("id_number")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Member ID
                    {sortField === "id_number" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("membership_level")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Level
                    {sortField === "membership_level" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("is_active")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Status
                    {sortField === "is_active" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Joined
                    {sortField === "created_at" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  First Purchase
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedReferrals.map((referral) => {
                const levelData = getLevel(referral.membership_level);
                const levelName = getLevelName(referral.membership_level);
                const levelIcon = levelIcons[referral.membership_level] || "🌟";
                const levelColor = levelData.textColor;

                return (
                  <tr key={referral.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${levelData.bgColor} bg-opacity-20 text-sm font-bold ${levelColor}`}>
                          {referral.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-white">{referral.full_name}</p>
                          <p className="text-xs text-slate-400">{referral.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 font-mono">{referral.id_number}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-sm ${levelColor}`}>
                        {levelIcon}
                        {levelName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {referral.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatDate(referral.created_at)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {referral.first_purchase_date ? formatDate(referral.first_purchase_date) : "❌ Not yet"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}