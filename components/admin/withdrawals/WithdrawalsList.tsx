"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import {
  Eye,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  mobile_number: string | null;
  crypto_address: string | null;
  status: string;
  notes: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_full_name?: string;
};

type FilterOptions = {
  status: string;
  payment_method: string;
  date_from: string;
  date_to: string;
  search: string;
};

type StatusAction = "approve" | "reject" | "complete";

export default function WithdrawalsList() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "",
    payment_method: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction>("approve");
  const itemsPerPage = 10;

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("withdrawals")
        .select("*", { count: "exact" });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.payment_method) {
        query = query.eq("payment_method", filters.payment_method);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      if (filters.search) {
        query = query.or(
          `account_name.ilike.%${filters.search}%,account_number.ilike.%${filters.search}%`
        );
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const userIds = data?.map(w => w.user_id).filter(Boolean) || [];
      let userMap: Record<string, { email: string; full_name: string }> = {};

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (users) {
          userMap = users.reduce((acc, user) => ({
            ...acc,
            [user.id]: { email: user.email, full_name: user.full_name }
          }), {});
        }
      }

      const transformedData = data?.map((w: any) => ({
        ...w,
        user_email: userMap[w.user_id]?.email || "N/A",
        user_full_name: userMap[w.user_id]?.full_name || "N/A",
      })) || [];

      setWithdrawals(transformedData);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error loading withdrawals:", error);
      showToast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      payment_method: "",
      date_from: "",
      date_to: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleStatusChange = async () => {
    if (!selectedWithdrawal) return;

    try {
      // Map action to actual status
      const statusMap: Record<StatusAction, string> = {
        approve: "approved",
        reject: "rejected",
        complete: "completed",
      };

      const newStatus = statusMap[statusAction];
      let updateData: any = { status: newStatus };

      if (statusAction === "approve" || statusAction === "complete") {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("withdrawals")
        .update(updateData)
        .eq("id", selectedWithdrawal.id);

      if (error) throw error;

      const statusMessages = {
        approve: "Withdrawal approved successfully",
        reject: "Withdrawal rejected",
        complete: "Withdrawal marked as completed",
      };

      showToast.success(statusMessages[statusAction]);
      setShowStatusDialog(false);
      loadWithdrawals();
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      showToast.error("Failed to update withdrawal status");
    }
  };

  const handleViewWithdrawal = (withdrawal: Withdrawal) => {
    router.push(`/admin/withdrawals/${withdrawal.id}`);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      bank: "Bank Transfer",
      mobile_money: "Mobile Money",
      crypto: "Cryptocurrency",
    };
    return methods[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      bank: "text-blue-400",
      mobile_money: "text-purple-400",
      crypto: "text-orange-400",
    };
    return colors[method] || "text-slate-400";
  };

  const openConfirmDialog = (withdrawal: Withdrawal, action: StatusAction) => {
    setSelectedWithdrawal(withdrawal);
    setStatusAction(action);
    setShowStatusDialog(true);
  };

  const getDialogMessage = () => {
    if (!selectedWithdrawal) return "";

    const baseMessage = {
      approve: `Are you sure you want to approve this withdrawal request?`,
      reject: `Are you sure you want to reject this withdrawal request?`,
      complete: `Are you sure you want to mark this withdrawal as completed?`,
    };

    // Build payment method details
    let paymentDetails = "";
    if (selectedWithdrawal.payment_method === "bank") {
      paymentDetails = `
        Bank: ${selectedWithdrawal.bank_name || "N/A"}
        Account Name: ${selectedWithdrawal.account_name || "N/A"}
        Account Number: ${selectedWithdrawal.account_number || "N/A"}`;
    } else if (selectedWithdrawal.payment_method === "mobile_money") {
      paymentDetails = `
        Mobile Number: ${selectedWithdrawal.mobile_number || "N/A"}`;
    } else if (selectedWithdrawal.payment_method === "crypto") {
      paymentDetails = `
        Wallet Address: ${selectedWithdrawal.crypto_address?.slice(0, 20) || "N/A"}...`;
    }

    const details = `
      Member: ${selectedWithdrawal.user_full_name || "N/A"}
      Amount: ₦${selectedWithdrawal.amount.toLocaleString()}
      Method: ${getPaymentMethodLabel(selectedWithdrawal.payment_method)}${paymentDetails}
      Requested: ${new Date(selectedWithdrawal.created_at).toLocaleString()}
    `;

    return `${baseMessage[statusAction]}\n\n${details}`;
  };

  const getDialogConfig = () => {
    switch (statusAction) {
      case "approve":
        return {
          title: "Approve Withdrawal Request",
          confirmText: "Yes, Approve",
          type: "success" as const,
        };
      case "reject":
        return {
          title: "Reject Withdrawal Request",
          confirmText: "Yes, Reject",
          type: "danger" as const,
        };
      case "complete":
        return {
          title: "Mark as Completed",
          confirmText: "Yes, Complete",
          type: "info" as const,
        };
    }
  };

  const columns = [
    {
      key: "user",
      header: "Member",
      width: "180px",
      render: (item: Withdrawal) => (
        <div>
          <p className="font-medium text-white truncate max-w-[120px]">
            {item.user_full_name || "N/A"}
          </p>
          <p className="text-xs text-slate-400 truncate max-w-[120px]">
            {item.user_email}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "120px",
      render: (item: Withdrawal) => (
        <span className="font-bold text-emerald-400">
          ₦{item.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "Method",
      width: "140px",
      render: (item: Withdrawal) => (
        <span className={getPaymentMethodColor(item.payment_method)}>
          {getPaymentMethodLabel(item.payment_method)}
        </span>
      ),
    },
    {
      key: "account_details",
      header: "Account Details",
      width: "160px",
      render: (item: Withdrawal) => {
        if (item.payment_method === "bank") {
          return (
            <div className="text-sm">
              <p className="text-white truncate max-w-[100px]">{item.account_name}</p>
              <p className="text-xs text-slate-400">{item.account_number}</p>
            </div>
          );
        }
        if (item.payment_method === "mobile_money") {
          return (
            <div className="text-sm">
              <p className="text-white">{item.mobile_number}</p>
            </div>
          );
        }
        if (item.payment_method === "crypto") {
          return (
            <div className="text-sm">
              <p className="text-white truncate max-w-[120px]">{item.crypto_address}</p>
            </div>
          );
        }
        return <span className="text-slate-400">N/A</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (item: Withdrawal) => <StatusBadge status={item.status} type="order" />,
    },
    {
      key: "created_at",
      header: "Requested",
      width: "120px",
      render: (item: Withdrawal) => (
        <span className="text-slate-400 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "180px",
      render: (item: Withdrawal) => (
        <div className="flex items-center gap-1">
          {item.status === "pending" && (
            <>
              <button
                onClick={() => openConfirmDialog(item, "approve")}
                className="rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                title="Approve"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => openConfirmDialog(item, "reject")}
                className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                title="Reject"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          {item.status === "approved" && (
            <button
              onClick={() => openConfirmDialog(item, "complete")}
              className="rounded-lg p-1.5 text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
              title="Mark as Completed"
            >
              <Clock className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleViewWithdrawal(item)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const dialogConfig = getDialogConfig();

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full">
        <div className="w-full sm:flex-1 sm:max-w-[300px]">
          <SearchBar
            placeholder="Search by account name or number..."
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
            onClick={loadWithdrawals}
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-[280px]">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Payment Method
              </label>
              <select
                value={filters.payment_method}
                onChange={(e) => handleFilterChange("payment_method", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Methods</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="crypto">Cryptocurrency</option>
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

      {/* Withdrawals Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="min-w-[900px]">
          <DataTable
            data={withdrawals}
            columns={columns}
            loading={loading}
            emptyMessage="No withdrawal requests found"
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

      {/* Status Change Dialog */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={handleStatusChange}
        title={dialogConfig?.title || "Confirm"}
        message={getDialogMessage()}
        confirmText={dialogConfig?.confirmText || "Confirm"}
        cancelText="Cancel"
        type={dialogConfig?.type || "info"}
      />
    </div>
  );
}