"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Filter, RefreshCw, Search, X } from "lucide-react";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DataTable from "@/components/admin/DataTable";

type Activity = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
  user_full_name?: string;
  user_email?: string;
};

type FilterOptions = {
  type: string;
  date_from: string;
  date_to: string;
  search: string;
};

export default function ActivityLogs() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("activities")
        .select("*", { count: "exact" });

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Get user details
      const userIds = data?.map(a => a.user_id).filter(Boolean) || [];
      let userMap: Record<string, { full_name: string; email: string }> = {};

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (users) {
          userMap = users.reduce((acc, user) => ({
            ...acc,
            [user.id]: { full_name: user.full_name || "N/A", email: user.email || "N/A" }
          }), {});
        }
      }

      const transformedData = data?.map((a: any) => ({
        ...a,
        user_full_name: userMap[a.user_id]?.full_name || "N/A",
        user_email: userMap[a.user_id]?.email || "N/A",
      })) || [];

      setActivities(transformedData);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error loading activities:", error);
      showToast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      date_from: "",
      date_to: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      account: "text-emerald-400",
      purchase: "text-blue-400",
      referral: "text-purple-400",
      points: "text-yellow-400",
      general: "text-slate-400",
    };
    return colors[type] || "text-slate-400";
  };

  const getActivityTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      account: "📝",
      purchase: "🛒",
      referral: "👥",
      points: "⭐",
      general: "📋",
    };
    return icons[type] || "📋";
  };

  const columns = [
    {
      key: "user",
      header: "User",
      width: "180px",
      render: (item: Activity) => (
        <div>
          <p className="font-medium text-white truncate max-w-[120px]">
            {item.user_full_name || "N/A"}
          </p>
          <p className="text-xs text-slate-400 truncate max-w-[120px]">
            {item.user_email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "title",
      header: "Activity",
      width: "200px",
      render: (item: Activity) => (
        <span className="text-white font-medium truncate block max-w-[180px]">
          {item.title}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      width: "250px",
      render: (item: Activity) => (
        <span className="text-slate-300 truncate block max-w-[230px]">
          {item.description}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "100px",
      render: (item: Activity) => (
        <span className={`${getActivityTypeColor(item.type)}`}>
          {getActivityTypeIcon(item.type)} {item.type}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      width: "160px",
      render: (item: Activity) => (
        <span className="text-slate-400 whitespace-nowrap">
          {new Date(item.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full">
        <div className="w-full sm:flex-1 sm:max-w-[300px]">
          <SearchBar
            placeholder="Search activities..."
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

          <button
            onClick={loadActivities}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-[280px]">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Activity Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="account">Account</option>
                <option value="purchase">Purchase</option>
                <option value="referral">Referral</option>
                <option value="points">Points</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Activities Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="min-w-[700px]">
          <DataTable
            data={activities}
            columns={columns}
            loading={loading}
            emptyMessage="No activities found"
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