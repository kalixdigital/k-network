"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Eye, Search, Filter, X, Users, Award, TrendingUp } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DataTable from "@/components/admin/DataTable";

type Member = {
  id: string;
  full_name: string;
  email: string;
  id_number: string;
  phone: string;
  country: string;
  state: string;
  membership_level: number;
  monthly_points: number;
  lifetime_points: number;
  monthly_earnings: number;
  lifetime_earnings: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_verified: boolean;
  role: string;
  created_at: string;
};

type FilterOptions = {
  is_verified: string;
  membership_level: string;
  role: string;
  search: string;
};

export default function MembersList() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    is_verified: "",
    membership_level: "",
    role: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" });

      if (filters.is_verified) {
        query = query.eq("is_verified", filters.is_verified === "true");
      }

      if (filters.membership_level) {
        query = query.eq("membership_level", parseInt(filters.membership_level));
      }

      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,id_number.ilike.%${filters.search}%`
        );
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setMembers(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error loading members:", error);
      showToast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      is_verified: "",
      membership_level: "",
      role: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleViewMember = (member: Member) => {
    router.push(`/admin/members/${member.id}`);
  };

  const columns = [
    {
      key: "member",
      header: "Member",
      width: "220px",
      render: (item: Member) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            {item.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-medium text-white truncate max-w-[120px]">
              {item.full_name || "N/A"}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[120px]">
              {item.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "id_number",
      header: "Member ID",
      width: "120px",
      render: (item: Member) => (
        <span className="font-mono text-sm text-slate-300">
          {item.id_number || "N/A"}
        </span>
      ),
    },
    {
      key: "membership_level",
      header: "Level",
      width: "80px",
      render: (item: Member) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-400">
          <Award className="h-3 w-3" />
          {item.membership_level}
        </span>
      ),
    },
    {
      key: "monthly_points",
      header: "Points",
      width: "100px",
      render: (item: Member) => (
        <div>
          <p className="text-yellow-400">{item.monthly_points}</p>
          <p className="text-xs text-slate-500">
            Lifetime: {item.lifetime_points}
          </p>
        </div>
      ),
    },
    {
      key: "monthly_earnings",
      header: "Earnings",
      width: "120px",
      render: (item: Member) => (
        <div>
          <p className="text-emerald-400">
            ₦{item.monthly_earnings?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-slate-500">
            Lifetime: ₦{item.lifetime_earnings?.toLocaleString() || 0}
          </p>
        </div>
      ),
    },
    {
      key: "referrals",
      header: "Referrals",
      width: "100px",
      render: (item: Member) => (
        <div>
          <p className="text-white">Direct: {item.direct_referrals || 0}</p>
          <p className="text-xs text-slate-500">
            Indirect: {item.indirect_referrals || 0}
          </p>
        </div>
      ),
    },
    {
      key: "is_verified",
      header: "Status",
      width: "120px",
      render: (item: Member) => (
        <StatusBadge status={item.is_verified ? "active" : "inactive"} type="member" />
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "100px",
      render: (item: Member) => (
        <StatusBadge status={item.role || "user"} type="member" />
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      width: "120px",
      render: (item: Member) => (
        <span className="text-slate-400 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "80px",
      render: (item: Member) => (
        <button
          onClick={() => handleViewMember(item)}
          className="rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
          title="View Member"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full">
        <div className="w-full sm:flex-1 sm:max-w-[300px]">
          <SearchBar
            placeholder="Search by name, email, or member ID..."
            onSearch={(query) => handleFilterChange("search", query)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition whitespace-nowrap ${
              showFilters
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {Object.values(filters).some((v) => v) && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                {Object.values(filters).filter((v) => v).length}
              </span>
            )}
          </button>

          {Object.values(filters).some((v) => v) && (
            <button
              onClick={clearFilters}
              className="text-sm text-slate-400 hover:text-white whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 w-full overflow-x-auto">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-[280px]">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Status
              </label>
              <select
                value={filters.is_verified}
                onChange={(e) => handleFilterChange("is_verified", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="true">Verified</option>
                <option value="false">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Membership Level
              </label>
              <select
                value={filters.membership_level}
                onChange={(e) => handleFilterChange("membership_level", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
                <option value="6">Level 6</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="min-w-[1000px]">
          <DataTable
            data={members}
            columns={columns}
            loading={loading}
            emptyMessage="No members found"
          />
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="w-full overflow-x-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  );
}