// components/admin/genealogy/GenealogyList.tsx - Updated

'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { 
  Users, 
  Search, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  User,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Crown,
  TrendingUp,
  UserPlus,
  GitBranch,
  Eye
} from "lucide-react";
import { getLevel, getLevelName } from "@/lib/constants/levels";
import MemberDetailsModal from "./MemberDetailsModal";
import GenealogyStats from "./GenealogyStats";
import GenealogySearch from "./GenealogySearch";
import GenealogyTreeNode from "./GenealogyTreeNode";
import type { Member, TreeNode } from "./types";

export default function GenealogyList() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedAll, setExpandedAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          phone,
          id_number,
          membership_level,
          direct_referrals,
          indirect_referrals,
          is_verified,
          is_active,
          referred_by,
          created_at,
          country,
          state,
          points,
          total_earnings
        `)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMembers(data || []);
      
      if (data && data.length > 0) {
        const treeData = buildTree(data);
        setTree(treeData);
        
        // Auto-expand first level
        if (treeData.length > 0) {
          const firstIds = treeData.map(node => node.member.id);
          setExpandedNodes(new Set(firstIds));
        }
      }
    } catch (error) {
      console.error("Error loading members:", error);
      showToast.error("Failed to load genealogy data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const buildTree = (members: Member[]): TreeNode[] => {
    const childrenMap = new Map<string, Member[]>();
    members.forEach(m => {
      if (m.referred_by) {
        const children = childrenMap.get(m.referred_by) || [];
        children.push(m);
        childrenMap.set(m.referred_by, children);
      }
    });

    const roots = members.filter(m => !m.referred_by || m.referred_by === null);

    const buildNode = (member: Member, level: number): TreeNode => {
      const children = (childrenMap.get(member.id) || []).map(child => 
        buildNode(child, level + 1)
      );
      return { member, children, level };
    };

    return roots.map(root => buildNode(root, 0));
  };

  const getDownlineCount = (memberId: string): number => {
    const countChildren = (node: TreeNode): number => {
      let count = node.children.length;
      node.children.forEach(child => {
        count += countChildren(child);
      });
      return count;
    };

    const findNode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.member.id === memberId) return node;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };

    const node = findNode(tree);
    return node ? countChildren(node) : 0;
  };

  const toggleNode = (memberId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (expandedAll) {
      setExpandedNodes(new Set());
      setExpandedAll(false);
    } else {
      const allIds = new Set<string>();
      const collectIds = (nodes: TreeNode[]) => {
        nodes.forEach(node => {
          allIds.add(node.member.id);
          collectIds(node.children);
        });
      };
      collectIds(tree);
      setExpandedNodes(allIds);
      setExpandedAll(true);
    }
  };

  const handleViewMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsModalOpen(true);
  };

  // Filter tree based on search
  const filteredTree = searchQuery ? 
    tree.filter(node => {
      const matches = (node: TreeNode): boolean => {
        const member = node.member;
        const match = 
          member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.id_number?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (match) return true;
        return node.children.some(child => matches(child));
      };
      return matches(node);
    }) : tree;

  const stats = {
    total: members.length,
    verified: members.filter(m => m.is_verified).length,
    pending: members.filter(m => !m.is_verified).length,
    active: members.filter(m => m.is_active).length,
    rootMembers: tree.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-3 text-sm sm:text-base">Loading genealogy data...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 sm:p-12 text-center">
        <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-600" />
        <h3 className="mt-4 text-lg sm:text-xl font-semibold text-white">No members yet</h3>
        <p className="mt-2 text-sm sm:text-base text-slate-400">Members will appear here once they join</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
            Genealogy Tree
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">View and manage your referral network structure</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            {expandedAll ? 'Collapse All' : 'Expand All'}
          </button>
          <button
            onClick={loadMembers}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <GenealogyStats stats={stats} />

      {/* Search */}
      <GenealogySearch
        value={searchQuery}
        onChange={setSearchQuery}
        totalMembers={members.length}
      />

      {/* Tree */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:p-6 overflow-x-auto">
        {filteredTree.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No members found matching your search</p>
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2 min-w-[300px]">
            {filteredTree.map((node) => (
              <GenealogyTreeNode
                key={node.member.id}
                node={node}
                isExpanded={expandedNodes.has(node.member.id)}
                onToggle={toggleNode}
                onView={handleViewMember}
                getDownlineCount={getDownlineCount}
                selectedMemberId={selectedMemberId}
                expandedNodes={expandedNodes} // ✅ Pass expandedNodes down
              />
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Verified
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          Pending
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          Level 1
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          Level 2+
        </span>
        <span className="text-slate-500 ml-auto hidden sm:block">
          Click on a member to view details
        </span>
      </div>

      {/* Member Details Modal */}
      {selectedMemberId && (
        <MemberDetailsModal
          memberId={selectedMemberId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMemberId(null);
          }}
        />
      )}
    </div>
  );
}