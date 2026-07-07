"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Search, Users, ChevronRight, ChevronDown, User, Award } from "lucide-react";
import SearchBar from "@/components/admin/SearchBar";

type Member = {
  id: string;
  full_name: string;
  email: string;
  id_number: string;
  membership_level: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_verified: boolean;
  referred_by: string | null;
  created_at: string;
};

type TreeNode = {
  member: Member;
  children: TreeNode[];
  level: number;
};

export default function GenealogyList() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      // Get all members with their referral relationships
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          id_number,
          membership_level,
          direct_referrals,
          indirect_referrals,
          is_verified,
          referred_by,
          created_at
        `)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMembers(data || []);
      
      // Build the tree
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
    // Find root members (those with no referrer or referred_by is null)
    const memberMap = new Map<string, Member>();
    members.forEach(m => memberMap.set(m.id, m));

    const childrenMap = new Map<string, Member[]>();
    members.forEach(m => {
      if (m.referred_by) {
        const children = childrenMap.get(m.referred_by) || [];
        children.push(m);
        childrenMap.set(m.referred_by, children);
      }
    });

    // Find root nodes (members with no referrer)
    const roots = members.filter(m => !m.referred_by || m.referred_by === null);

    const buildNode = (member: Member, level: number): TreeNode => {
      const children = (childrenMap.get(member.id) || []).map(child => 
        buildNode(child, level + 1)
      );
      return {
        member,
        children,
        level
      };
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

  const handleViewMember = (memberId: string) => {
    router.push(`/admin/members/${memberId}`);
  };

  const filteredMembers = members.filter(member =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.id_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTreeNode = (node: TreeNode, index: number) => {
    const isExpanded = expandedNodes.has(node.member.id);
    const hasChildren = node.children.length > 0;
    const downlineCount = getDownlineCount(node.member.id);

    return (
      <div key={node.member.id} className="relative">
        <div 
          className={`flex items-center gap-3 rounded-lg p-3 transition cursor-pointer ${
            selectedMember?.id === node.member.id
              ? "bg-emerald-500/20 border border-emerald-500/30"
              : "hover:bg-slate-800/50"
          }`}
          style={{ marginLeft: `${node.level * 24}px` }}
        >
          {/* Tree Line */}
          {node.level > 0 && (
            <div className="absolute left-[-16px] top-1/2 h-px w-4 bg-slate-700" />
          )}

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.member.id);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* Avatar */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
            node.member.is_verified
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-slate-700 text-slate-400"
          }`}>
            <User className="h-5 w-5" />
          </div>

          {/* Member Info */}
          <div 
            className="flex-1 min-w-0"
            onClick={() => {
              setSelectedMember(node.member);
              handleViewMember(node.member.id);
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">
                {node.member.full_name || "Unknown"}
              </span>
              <span className="text-xs text-slate-400">
                {node.member.id_number}
              </span>
              {!node.member.is_verified && (
                <span className="text-xs text-yellow-400">(Pending)</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Level {node.member.membership_level}</span>
              <span>•</span>
              <span>{node.children.length} direct</span>
              <span>•</span>
              <span>{downlineCount} downline</span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Award className="h-3 w-3" />
                {node.member.direct_referrals || 0}
              </span>
            </div>
          </div>

          {/* View Button */}
          <button
            onClick={() => handleViewMember(node.member.id)}
            className="rounded-lg px-3 py-1 text-sm text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            View
          </button>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-1 space-y-1">
            {node.children.map((child, idx) => (
              <div key={child.member.id}>
                {renderTreeNode(child, idx)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading genealogy data...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 text-xl font-semibold text-white">No members yet</h3>
        <p className="mt-2 text-slate-400">Members will appear here once they join</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full sm:max-w-[300px]">
          <SearchBar
            placeholder="Search by name, email, or member ID..."
            onSearch={setSearchQuery}
          />
        </div>
        <div className="text-sm text-slate-400">
          {members.length} total members • {tree.length} root members
        </div>
      </div>

      {/* Genealogy Tree */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="space-y-2">
          {filteredTree.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No members found matching your search</p>
            </div>
          ) : (
            filteredTree.map((node, index) => renderTreeNode(node, index))
          )}
        </div>
      </div>
    </div>
  );
}