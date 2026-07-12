"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User, Users, Award, Mail, Phone } from "lucide-react";
import { getLevel, getLevelName } from "@/lib/constants/levels";

type GenealogyNode = {
  id: string;
  full_name: string;
  id_number: string;
  email: string;
  phone?: string;
  membership_level: number;
  points: number;
  direct_referrals: number;
  is_active: boolean;
  joined_at: string;
  children?: GenealogyNode[];
  level?: number;
};

type GenealogyTreeProps = {
  tree: GenealogyNode | null;
  loading: boolean;
  onSelectUser: (userId: string) => void;
};

// Level icons mapping
const levelIcons: Record<number, string> = {
  1: "🌟",
  2: "🥉",
  3: "🥈",
  4: "🥇",
  5: "💎",
  6: "👑",
};

// Dark theme backgrounds for nodes
const getNodeBg = (level: number, isCurrentUser: boolean): string => {
  if (isCurrentUser) {
    switch (level) {
      case 1:
        return "bg-emerald-950/40 border-emerald-500/30";
      case 2:
        return "bg-blue-950/40 border-blue-500/30";
      case 3:
        return "bg-purple-950/40 border-purple-500/30";
      case 4:
        return "bg-yellow-950/40 border-yellow-500/30";
      case 5:
        return "bg-orange-950/40 border-orange-500/30";
      case 6:
        return "bg-cyan-950/40 border-cyan-500/30";
      default:
        return "bg-emerald-950/40 border-emerald-500/30";
    }
  }
  return "bg-slate-800/50 border-slate-700";
};

const TreeNode = ({ 
  node, 
  level = 0, 
  onSelectUser,
  isLast = true 
}: { 
  node: GenealogyNode; 
  level?: number; 
  onSelectUser: (userId: string) => void;
  isLast?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const levelData = getLevel(node.membership_level);
  const levelIcon = levelIcons[node.membership_level] || "🌟";
  const levelName = getLevelName(node.membership_level);
  const isCurrentUser = level === 0;
  const nodeBg = getNodeBg(node.membership_level, isCurrentUser);

  return (
    <div className="relative">
      {/* Vertical line for tree structure */}
      {level > 0 && (
        <div className="absolute left-4 top-0 h-full w-px bg-slate-700/50" />
      )}

      <div className="relative flex items-start gap-3">
        {/* Horizontal connector line */}
        {level > 0 && (
          <div className="absolute left-4 top-6 h-px w-4 bg-slate-700/50" />
        )}

        {/* Node Card */}
        <div className={`relative ${level > 0 ? 'ml-8' : ''}`}>
          <div
            className={`group rounded-xl border transition-all cursor-pointer ${nodeBg} shadow-lg backdrop-blur`}
            onClick={() => onSelectUser(node.id)}
          >
            <div className="flex items-center gap-3 p-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isCurrentUser 
                    ? `${levelData.bgColor} text-white` 
                    : 'bg-slate-700/50 text-slate-300'
                } font-bold text-sm`}>
                  {node.full_name?.charAt(0) || "U"}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium truncate ${isCurrentUser ? levelData.textColor : 'text-white'}`}>
                    {node.full_name}
                    {isCurrentUser && " (You)"}
                  </p>
                  <span className={`text-xs ${levelData.textColor}`}>
                    {levelIcon} {levelName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono">{node.id_number}</span>
                  <span>•</span>
                  <span>{node.direct_referrals} referrals</span>
                  <span>•</span>
                  <span>{node.points} pts</span>
                  {node.is_active ? (
                    <span className="text-emerald-400">● Active</span>
                  ) : (
                    <span className="text-yellow-400">○ Pending</span>
                  )}
                </div>
              </div>

              {/* Expand/Collapse */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="flex-shrink-0 rounded-lg p-1 hover:bg-slate-800 transition"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="relative mt-2 pl-4">
              {node.children!.map((child, index) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  onSelectUser={onSelectUser}
                  isLast={index === node.children!.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function GenealogyTree({ tree, loading, onSelectUser }: GenealogyTreeProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent mx-auto" />
          <p className="text-slate-400 mt-4">Loading genealogy tree...</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-slate-600 mx-auto" />
        <p className="mt-4 text-slate-400">No genealogy data available</p>
        <p className="text-sm text-slate-500">Start referring people to build your tree</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Genealogy Tree</h2>
          <p className="text-sm text-slate-400">Your referral network structure</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            You
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            Referrals
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          <TreeNode node={tree} onSelectUser={onSelectUser} />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-800/30 p-3 text-center">
        <p className="text-xs text-slate-400">
          💡 Click on any member to view their details and earnings
        </p>
      </div>
    </div>
  );
}