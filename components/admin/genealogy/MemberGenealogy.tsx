"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { ArrowLeft, User, Award, Users, ChevronRight, ChevronDown } from "lucide-react";

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

type Props = {
  id: string;
};

export default function MemberGenealogy({ id }: Props) {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMemberGenealogy();
  }, [id]);

  const loadMemberGenealogy = async () => {
    setLoading(true);
    try {
      // Load member
      const { data: memberData, error: memberError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (memberError) throw memberError;

      if (!memberData) {
        showToast.error("Member not found");
        router.push("/admin/genealogy");
        return;
      }

      setMember(memberData);

      // Load all members for tree building
      const { data: allMembers, error: allError } = await supabase
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
        `);

      if (allError) throw allError;

      // Build tree starting from this member
      const treeData = buildTree(allMembers || [], id);
      setTree(treeData);

      // Auto-expand first level
      if (treeData) {
        const firstIds = treeData.children.map(node => node.member.id);
        setExpandedNodes(new Set(firstIds));
      }
    } catch (error) {
      console.error("Error loading genealogy:", error);
      showToast.error("Failed to load genealogy data");
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (members: Member[], rootId: string): TreeNode | null => {
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

    const root = memberMap.get(rootId);
    if (!root) return null;

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

    return buildNode(root, 0);
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

  const getDownlineCount = (node: TreeNode): number => {
    let count = node.children.length;
    node.children.forEach(child => {
      count += getDownlineCount(child);
    });
    return count;
  };

  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.member.id);
    const hasChildren = node.children.length > 0;
    const downlineCount = getDownlineCount(node);

    return (
      <div key={node.member.id} className="relative">
        <div 
          className={`flex items-center gap-3 rounded-lg p-3 transition ${
            node.member.id === id
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
              onClick={() => toggleNode(node.member.id)}
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">
                {node.member.full_name || "Unknown"}
              </span>
              <span className="text-xs text-slate-400">
                {node.member.id_number}
              </span>
              {node.member.id === id && (
                <span className="text-xs text-emerald-400">(You)</span>
              )}
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
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-1 space-y-1">
            {node.children.map(child => renderTreeNode(child))}
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

  if (!member || !tree) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Member not found</p>
        <button
          onClick={() => router.push("/admin/genealogy")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Genealogy
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/genealogy")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Genealogy
      </button>

      {/* Member Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl font-bold text-emerald-400">
            {member.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {member.full_name || "N/A"}
            </h1>
            <p className="text-sm text-slate-400">{member.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <span className="text-sm text-slate-400">Member ID: {member.id_number}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-400">Level {member.membership_level}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-yellow-400">{tree.children.length} Direct Referrals</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-emerald-400">{getDownlineCount(tree)} Downline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Genealogy Tree */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Referral Tree</h2>
        <div className="space-y-2">
          {renderTreeNode(tree)}
        </div>
      </div>
    </div>
  );
}