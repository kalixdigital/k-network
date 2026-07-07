"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Eye, Search, Filter, X } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type Order = {
  id: string;
  order_number: string;
  user_id: string;
  member_id: string;
  total: number;
  total_points: number;
  status: string;
  payment_status: string;
  payment_proof: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
};

type FilterOptions = {
  status: string;
  payment_status: string;
  date_from: string;
  date_to: string;
  search: string;
};

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "",
    payment_status: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.payment_status) {
        query = query.eq("payment_status", filters.payment_status);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      if (filters.search) {
        query = query.or(
          `order_number.ilike.%${filters.search}%,member_id.ilike.%${filters.search}%`
        );
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Query error:", error);
        showToast.error("Failed to load orders");
        setLoading(false);
        return;
      }

      let transformedData = data || [];
      
      if (data && data.length > 0) {
        const userIds = data.map(order => order.user_id).filter(Boolean);
        
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", userIds);

          if (!profilesError && profiles) {
            const emailMap: Record<string, string> = {};
            profiles.forEach((profile: any) => {
              emailMap[profile.id] = profile.email || "N/A";
            });

            transformedData = data.map((order: any) => ({
              ...order,
              user_email: emailMap[order.user_id] || "N/A",
            }));
          }
        }
      }

      setOrders(transformedData);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error loading orders:", error);
      showToast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      payment_status: "",
      date_from: "",
      date_to: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleViewOrder = (order: Order) => {
    router.push(`/admin/orders/${order.id}`);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete);

      if (error) throw error;

      showToast.success("Order deleted successfully");
      loadOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast.error("Failed to delete order");
    } finally {
      setOrderToDelete(null);
    }
  };

  const getStatusFilterOptions = () => {
    return [
      { value: "", label: "All Statuses" },
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ];
  };

  const getPaymentStatusOptions = () => {
    return [
      { value: "", label: "All Payment Statuses" },
      { value: "pending", label: "Pending" },
      { value: "paid", label: "Paid" },
      { value: "failed", label: "Failed" },
    ];
  };

  const columns = [
    {
      key: "order_number",
      header: "Order Number",
      width: "150px",
      render: (item: Order) => (
        <span className="font-medium text-white">{item.order_number}</span>
      ),
    },
    {
      key: "user_email",
      header: "Customer",
      width: "180px",
      render: (item: Order) => (
        <span className="text-slate-300 truncate block max-w-[150px]">
          {item.user_email || "N/A"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      width: "120px",
      render: (item: Order) => (
        <span className="font-bold text-emerald-400">
          ₦{item.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: "total_points",
      header: "Points",
      width: "80px",
      render: (item: Order) => (
        <span className="text-yellow-400">{item.total_points}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (item: Order) => <StatusBadge status={item.status} type="order" />,
    },
    {
      key: "payment_status",
      header: "Payment",
      width: "120px",
      render: (item: Order) => (
        <StatusBadge status={item.payment_status} type="payment" />
      ),
    },
    {
      key: "created_at",
      header: "Date",
      width: "120px",
      render: (item: Order) => (
        <span className="text-slate-400 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      render: (item: Order) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewOrder(item)}
            className="rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
            title="View Order"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOrderToDelete(item.id)}
            className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            title="Delete Order"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
return (
  <div className="w-full max-w-full space-y-4">
    {/* Search and Filters */}
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full">
      <div className="w-full sm:flex-1 sm:max-w-[300px]">
        <SearchBar
          placeholder="Search by order number or member ID..."
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
          {/* Filter fields... */}
        </div>
      </div>
    )}

    {/* Orders Table - with proper overflow */}
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
      <div className="min-w-[700px]">
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="No orders found"
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

    {/* Delete Confirmation */}
    <ConfirmDialog
      isOpen={!!orderToDelete}
      onClose={() => setOrderToDelete(null)}
      onConfirm={handleDeleteOrder}
      title="Delete Order"
      message="Are you sure you want to delete this order? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
  </div>
);
}