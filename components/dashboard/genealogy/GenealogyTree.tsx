"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User, Users, Award, Mail, Phone, ChevronLeft } from "lucide-react";
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

// Mobile-optimized TreeNode with improved spacing
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
    <div className="relative mb-5 sm:mb-6">
      {/* Vertical line for tree structure - hidden on mobile */}
      {level > 0 && (
        <div className="absolute left-3 top-0 h-full w-px bg-slate-700/50 hidden sm:block" />
      )}

      <div className="relative flex items-start gap-2 sm:gap-3">
        {/* Horizontal connector line - hidden on mobile */}
        {level > 0 && (
          <div className="absolute left-3 top-6 h-px w-3 sm:w-4 bg-slate-700/50 hidden sm:block" />
        )}

        {/* Node Card - Mobile optimized with more indentation */}
        <div className={`relative w-full ${level > 0 ? 'ml-6 sm:ml-10' : ''}`}>
          <div
            className={`group rounded-xl border transition-all cursor-pointer ${nodeBg} shadow-lg backdrop-blur hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => onSelectUser(node.id)}
          >
            {/* Mobile-optimized layout with taller cards */}
            <div className="flex items-center gap-3 sm:gap-4 py-4 px-4 sm:py-5 sm:px-5">
              {/* Avatar - Smaller on mobile */}
              <div className="flex-shrink-0">
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full ${
                  isCurrentUser 
                    ? `${levelData.bgColor} text-white` 
                    : 'bg-slate-700/50 text-slate-300'
                } font-bold text-xs sm:text-sm`}>
                  {node.full_name?.charAt(0) || "U"}
                </div>
              </div>

              {/* Info - Mobile optimized - REMOVED points and referrals */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className={`font-medium text-sm sm:text-base truncate ${isCurrentUser ? levelData.textColor : 'text-white'}`}>
                    {node.full_name}
                    {isCurrentUser && " (You)"}
                  </p>
                  <span className={`text-[10px] sm:text-xs ${levelData.textColor} whitespace-nowrap`}>
                    {levelIcon} {levelName}
                  </span>
                </div>
                
                {/* Info row - Clean and minimal */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-400 mt-1">
                  <span className="font-mono truncate max-w-[60px] sm:max-w-none">{node.id_number}</span>
                  <span className="hidden xs:inline">•</span>
                  <span className="flex items-center gap-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      node.is_active ? 'bg-emerald-400' : 'bg-yellow-400'
                    }`} />
                    <span className="hidden xs:inline">
                      {node.is_active ? 'Active' : 'Pending'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Expand/Collapse - Touch-friendly */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="flex-shrink-0 rounded-lg p-1.5 sm:p-1 hover:bg-slate-800 transition touch-manipulation"
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

          {/* Children - Mobile optimized with more spacing */}
          {hasChildren && isExpanded && (
            <div className="relative mt-4 sm:mt-5 pl-4 sm:pl-6">
              {/* Vertical line connecting children - taller and cleaner */}
              <div className="absolute left-2 top-0 h-[calc(100%-18px)] w-px bg-slate-700/40 sm:left-5" />
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
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent mx-auto" />
          <p className="text-slate-400 mt-3 text-sm sm:text-base">Loading genealogy tree...</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Users className="h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mx-auto" />
        <p className="mt-3 text-slate-400 text-sm sm:text-base">No genealogy data available</p>
        <p className="text-xs sm:text-sm text-slate-500">Start referring people to build your tree</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-6 shadow-xl backdrop-blur">
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            Genealogy Tree
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Your referral network structure</p>
        </div>
        
        {/* Legend - Mobile friendly */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] sm:text-xs">You</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            <span className="text-[10px] sm:text-xs">Referrals</span>
          </span>
          <button
            onClick={() => setShowMobileInfo(!showMobileInfo)}
            className="lg:hidden text-emerald-400 hover:text-emerald-300 text-[10px] sm:text-xs underline"
          >
            {showMobileInfo ? 'Hide info' : 'Show info'}
          </button>
        </div>
      </div>

      {/* Mobile info panel */}
      {showMobileInfo && (
        <div className="mb-3 sm:hidden rounded-lg bg-slate-800/30 p-3 text-center">
          <p className="text-xs text-slate-400">
            💡 Tap any member to view their details and earnings
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tap the arrow to expand/collapse branches
          </p>
        </div>
      )}

      {/* Tree - Mobile optimized with horizontal scroll on very small screens */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[280px] sm:min-w-[400px]">
          <TreeNode node={tree} onSelectUser={onSelectUser} />
        </div>
      </div>

      {/* Footer - Hide on very small screens */}
      <div className="mt-3 sm:mt-4 rounded-lg bg-slate-800/30 p-2 sm:p-3 text-center hidden xs:block">
        <p className="text-[10px] sm:text-xs text-slate-400">
          💡 Click on any member to view their details and earnings
        </p>
      </div>
    </div>
  );
}