// components/admin/genealogy/GenealogyTreeNode.tsx

'use client';

import { ChevronDown, ChevronRight, User, Award, Calendar, Eye } from 'lucide-react';
import { getLevel, getLevelName } from '@/lib/constants/levels';
import type { TreeNode } from './types';

interface GenealogyTreeNodeProps {
  node: TreeNode;
  isExpanded: boolean;
  onToggle: (memberId: string) => void;
  onView: (memberId: string) => void;
  getDownlineCount: (memberId: string) => number;
  selectedMemberId?: string | null;
  expandedNodes: Set<string>; // ✅ Add this prop
}

export default function GenealogyTreeNode({
  node,
  isExpanded,
  onToggle,
  onView,
  getDownlineCount,
  selectedMemberId,
  expandedNodes, // ✅ Receive expandedNodes
}: GenealogyTreeNodeProps) {
  const { member, children, level } = node;
  const hasChildren = children.length > 0;
  const downlineCount = getDownlineCount(member.id);
  const isSelected = selectedMemberId === member.id;
  const levelData = getLevel(member.membership_level);
  const levelName = getLevelName(member.membership_level);

  const getLevelBadgeColor = (level: number) => {
    const colors: Record<number, string> = {
      1: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      3: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      4: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      5: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      6: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    };
    return colors[level] || colors[1];
  };

  const getLevelIcon = (level: number) => {
    const icons: Record<number, string> = {
      1: "🌟",
      2: "🥉",
      3: "🥈",
      4: "🥇",
      5: "💎",
      6: "👑",
    };
    return icons[level] || "🌟";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative">
      {/* Card */}
      <div 
        className={`
          relative group rounded-xl border transition-all duration-200
          ${isSelected 
            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10' 
            : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600'
          }
        `}
        style={{ marginLeft: `${Math.min(level * 20, 80)}px` }}
      >
        {/* Tree line connector */}
        {level > 0 && (
          <>
            <div className="absolute left-[-16px] top-1/2 h-px w-4 bg-slate-600/50" />
            <div className="absolute left-[-16px] top-0 h-1/2 w-px bg-slate-600/50" />
            <div className="absolute left-[-16px] bottom-1/2 h-1/2 w-px bg-slate-600/50" />
          </>
        )}

        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(member.id);
              }}
              className="flex-shrink-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400 transition hover:bg-slate-600 hover:text-white"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="flex-shrink-0 w-6 sm:w-7" />}

          {/* Avatar */}
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => onView(member.id)}
          >
            <div className={`
              flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full text-sm sm:text-base font-bold transition
              ${member.is_verified 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }
            `}>
              {member.full_name?.charAt(0) || "U"}
            </div>
            {/* Level indicator badge on avatar */}
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1">
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[8px] sm:text-[10px] bg-slate-800 border border-slate-600">
                {member.membership_level}
              </span>
            </div>
          </div>

          {/* Member Info */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onView(member.id)}
          >
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-medium text-white truncate max-w-[100px] sm:max-w-[200px]">
                {member.full_name || "Unknown"}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                #{member.id_number}
              </span>
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border ${getLevelBadgeColor(member.membership_level)}`}>
                {getLevelIcon(member.membership_level)} {levelName}
              </span>
              {!member.is_verified && (
                <span className="text-[10px] sm:text-xs text-yellow-400 bg-yellow-500/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                  Pending
                </span>
              )}
              {member.is_active && (
                <span className="text-[10px] sm:text-xs text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full hidden xs:inline">
                  Active
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-slate-400 mt-0.5">
              <span>{children.length} direct</span>
              <span className="hidden xs:inline">•</span>
              <span>{downlineCount} downline</span>
              <span className="hidden xs:inline">•</span>
              <span className="flex items-center gap-0.5 text-yellow-400">
                <Award className="h-3 w-3" />
                {member.direct_referrals || 0}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-0.5 text-slate-500">
                <Calendar className="h-3 w-3" />
                {formatDate(member.created_at)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => onView(member.id)}
              className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden xs:inline">View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
          {children.map((child) => (
            <GenealogyTreeNode
              key={child.member.id}
              node={child}
              isExpanded={expandedNodes.has(child.member.id)} // ✅ Use expandedNodes from props
              onToggle={onToggle}
              onView={onView}
              getDownlineCount={getDownlineCount}
              selectedMemberId={selectedMemberId}
              expandedNodes={expandedNodes} // ✅ Pass down
            />
          ))}
        </div>
      )}
    </div>
  );
}