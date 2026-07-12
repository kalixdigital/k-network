"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Gift, ShoppingBag, Users, Award, Clock } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type RewardEntry = {
  id: string;
  points: number;
  naira_equivalent: number;
  source: string;
  description: string;
  created_at: string;
};

type RewardsHistoryProps = {
  history: RewardEntry[];
  loading: boolean;
  userLevel?: number;
};

const sourceIcons: Record<string, React.ReactNode> = {
  purchase: <ShoppingBag className="h-3 w-3 text-blue-400" />,
  direct_referral: <Users className="h-3 w-3 text-purple-400" />,
  indirect_referral: <Users className="h-3 w-3 text-amber-400" />,
  registration: <Gift className="h-3 w-3 text-emerald-400" />,
  level_bonus: <Award className="h-3 w-3 text-yellow-400" />,
  manual_bonus: <Gift className="h-3 w-3 text-pink-400" />,
  adjustment: <Clock className="h-3 w-3 text-slate-400" />,
};

const sourceLabels: Record<string, string> = {
  purchase: "Purchase",
  direct_referral: "Direct Referral",
  indirect_referral: "Indirect Referral",
  registration: "Registration Bonus",
  level_bonus: "Level Bonus",
  manual_bonus: "Manual Bonus",
  adjustment: "Adjustment",
};

export default function RewardsHistory({ history, loading, userLevel = 1 }: RewardsHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof RewardEntry>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className={`h-8 w-8 animate-spin rounded-full border-4 ${levelBg} border-t-transparent mx-auto`} />
          <p className="text-slate-400 mt-4">Loading rewards history...</p>
        </div>
      </div>
    );
  }

  const filteredHistory = history.filter((entry) => {
    const search = searchTerm.toLowerCase();
    return (
      entry.description?.toLowerCase().includes(search) ||
      sourceLabels[entry.source]?.toLowerCase().includes(search) ||
      entry.points.toString().includes(search)
    );
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: keyof RewardEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceIcon = (source: string) => {
    return sourceIcons[source] || <Clock className="h-3 w-3 text-slate-400" />;
  };

  const getSourceLabel = (source: string) => {
    return sourceLabels[source] || source;
  };

  return (
    <div className={`rounded-2xl border ${levelData.borderColor} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Rewards History</h2>
          <p className="text-sm text-slate-400">
            Showing {filteredHistory.length} of {history.length} entries
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-lg border ${levelData.borderColor} bg-slate-900/50 pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:border-${levelColor} focus:outline-none`}
          />
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 text-slate-600 mx-auto" />
          <p className="mt-4 text-slate-400">No rewards yet</p>
          <p className="text-sm text-slate-500">Start earning rewards by making purchases and referring friends</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("source")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Source
                    {sortField === "source" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("description")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Description
                    {sortField === "description" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("points")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Points
                    {sortField === "points" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("naira_equivalent")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Value (₦)
                    {sortField === "naira_equivalent" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Date
                    {sortField === "created_at" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      {getSourceIcon(entry.source)}
                      <span className="text-white">{getSourceLabel(entry.source)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 max-w-[200px] truncate">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 font-semibold ${levelColor}`}>
                      +{entry.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    ₦{entry.naira_equivalent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-400">
                    {formatDate(entry.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}