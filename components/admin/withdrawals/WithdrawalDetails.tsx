"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  Smartphone,
  Bitcoin,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
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
};

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  membership_level: number;
  monthly_earnings: number;
  lifetime_earnings: number;
};

type Props = {
  id: string;
};

export default function WithdrawalDetails({ id }: Props) {
  const router = useRouter();
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  useEffect(() => {
    loadWithdrawalDetails();
  }, [id]);

  const loadWithdrawalDetails = async () => {
    setLoading(true);
    try {
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("id", id)
        .single();

      if (withdrawalError) throw withdrawalError;

      if (!withdrawalData) {
        showToast.error("Withdrawal not found");
        router.push("/admin/withdrawals");
        return;
      }

      setWithdrawal(withdrawalData);

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          phone,
          id_number,
          membership_level,
          monthly_earnings,
          lifetime_earnings
        `)
        .eq("id", withdrawalData.user_id)
        .single();

      if (userError) {
        console.error("User fetch error:", userError);
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error loading withdrawal details:", error);
      showToast.error("Failed to load withdrawal details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status };
      
      if (status === "approved" || status === "completed") {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("withdrawals")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      const statusMessages = {
        approved: "Withdrawal approved successfully",
        rejected: "Withdrawal rejected",
        completed: "Withdrawal marked as completed",
      };

      showToast.success(statusMessages[status as keyof typeof statusMessages] || "Status updated");
      
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setShowCompleteDialog(false);
      loadWithdrawalDetails();
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      showToast.error("Failed to update withdrawal status");
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showToast.error("Failed to copy");
    }
  };

  const getPaymentMethodIcon = () => {
    switch (withdrawal?.payment_method) {
      case "bank":
        return <Building2 className="h-5 w-5 text-blue-400" />;
      case "mobile_money":
        return <Smartphone className="h-5 w-5 text-purple-400" />;
      case "crypto":
        return <Bitcoin className="h-5 w-5 text-orange-400" />;
      default:
        return <CreditCard className="h-5 w-5 text-slate-400" />;
    }
  };

  const getPaymentMethodLabel = () => {
    switch (withdrawal?.payment_method) {
      case "bank":
        return "Bank Transfer";
      case "mobile_money":
        return "Mobile Money";
      case "crypto":
        return "Cryptocurrency";
      default:
        return "Unknown";
    }
  };

  const getStatusFlow = () => {
    const status = withdrawal?.status;
    const steps = [
      { key: "pending", label: "Requested", icon: Clock },
      { key: "approved", label: "Approved", icon: CheckCircle },
      { key: "completed", label: "Completed", icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex(s => s.key === status);
    
    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading withdrawal details...</p>
        </div>
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Withdrawal not found</p>
        <button
          onClick={() => router.push("/admin/withdrawals")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Withdrawals
        </button>
      </div>
    );
  }

  const canApprove = withdrawal.status === "pending";
  const canComplete = withdrawal.status === "approved";
  const canReject = withdrawal.status === "pending" || withdrawal.status === "approved";

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/withdrawals")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Withdrawals
      </button>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6 w-full min-w-0">
          {/* Withdrawal Header */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-white truncate">
                    Withdrawal #{withdrawal.id.slice(0, 8)}
                  </h1>
                  <StatusBadge status={withdrawal.status} type="order" />
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Requested on {new Date(withdrawal.created_at).toLocaleString()}
                </p>
                {withdrawal.processed_at && (
                  <p className="text-sm text-slate-400">
                    Processed on {new Date(withdrawal.processed_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <p className="text-sm text-slate-400">Amount</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-400">
                  ₦{withdrawal.amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Status Flow */}
            <div className="mt-6 w-full overflow-x-auto">
              <div className="flex items-center gap-2 min-w-[280px]">
                {getStatusFlow().map((step, index) => (
                  <div key={step.key} className="flex items-center flex-1 min-w-0">
                    <div className={`flex items-center gap-1 md:gap-2 ${
                      step.isActive ? "text-emerald-400" : "text-slate-500"
                    }`}>
                      <div className={`flex h-7 w-7 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        step.isCompleted ? "border-emerald-500 bg-emerald-500/20" :
                        step.isCurrent ? "border-emerald-500 bg-emerald-500/20" :
                        "border-slate-700"
                      }`}>
                        {step.isCompleted ? (
                          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-emerald-400" />
                        ) : (
                          <step.icon className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium truncate">{step.label}</span>
                    </div>
                    {index < getStatusFlow().length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 md:mx-2 ${
                        step.isCompleted ? "bg-emerald-500" : "bg-slate-700"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 w-full overflow-hidden">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {getPaymentMethodIcon()}
              Payment Details
            </h2>

            <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
              <div className="min-w-0">
                <p className="text-sm text-slate-400">Payment Method</p>
                <p className="text-white font-medium truncate">{getPaymentMethodLabel()}</p>
              </div>

              {withdrawal.payment_method === "bank" && (
                <>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-400">Bank Name</p>
                    <p className="text-white font-medium truncate">{withdrawal.bank_name || "N/A"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-400">Account Name</p>
                    <p className="text-white font-medium truncate">{withdrawal.account_name || "N/A"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-400">Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono font-medium truncate">
                        {withdrawal.account_number || "N/A"}
                      </p>
                      {withdrawal.account_number && (
                        <button
                          onClick={() => copyToClipboard(withdrawal.account_number!)}
                          className="p-1 text-slate-400 hover:text-white flex-shrink-0"
                        >
                          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {withdrawal.payment_method === "mobile_money" && (
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-sm text-slate-400">Mobile Number</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{withdrawal.mobile_number || "N/A"}</p>
                    {withdrawal.mobile_number && (
                      <button
                        onClick={() => copyToClipboard(withdrawal.mobile_number!)}
                        className="p-1 text-slate-400 hover:text-white flex-shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {withdrawal.payment_method === "crypto" && (
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-sm text-slate-400">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono font-medium text-sm break-all">
                      {withdrawal.crypto_address || "N/A"}
                    </p>
                    {withdrawal.crypto_address && (
                      <button
                        onClick={() => copyToClipboard(withdrawal.crypto_address!)}
                        className="p-1 text-slate-400 hover:text-white flex-shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {withdrawal.notes && (
              <div className="mt-4 pt-4 border-t border-slate-800 w-full">
                <p className="text-sm text-slate-400">Notes</p>
                <p className="text-white mt-1 break-words">{withdrawal.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6 w-full min-w-0">
          {/* Member Info */}
          {user && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 w-full overflow-hidden">
              <h2 className="text-xl font-bold text-white">Member Information</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-lg md:text-xl font-bold text-emerald-400">
                    {user.full_name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{user.full_name || "N/A"}</p>
                    <p className="text-sm text-slate-400 truncate">{user.id_number || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-white truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-white truncate">{user.phone || "N/A"}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between">
                  <span className="text-sm text-slate-400">Level</span>
                  <span className="text-white font-medium">Level {user.membership_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Monthly Earnings</span>
                  <span className="text-emerald-400">₦{user.monthly_earnings?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Lifetime Earnings</span>
                  <span className="text-emerald-400">₦{user.lifetime_earnings?.toLocaleString() || 0}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/members/${user.id}`)}
                className="mt-4 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 truncate"
              >
                View Member Profile
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 w-full overflow-hidden">
            <h2 className="text-xl font-bold text-white">Actions</h2>
            <div className="mt-4 space-y-3">
              {canApprove && (
                <button
                  onClick={() => setShowApproveDialog(true)}
                  disabled={updating}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  Approve Withdrawal
                </button>
              )}

              {canComplete && (
                <button
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={updating}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  Mark as Completed
                </button>
              )}

              {canReject && (
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={updating}
                  className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  Reject Withdrawal
                </button>
              )}

              <button
                onClick={loadWithdrawalDetails}
                disabled={updating}
                className="w-full rounded-lg border border-slate-700 px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 flex-shrink-0 ${updating ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={() => handleStatusChange("approved")}
        title="Approve Withdrawal"
        message={`Are you sure you want to approve this withdrawal of ₦${withdrawal.amount.toLocaleString()}?`}
        confirmText="Approve"
        cancelText="Cancel"
        type="success"
      />

      <ConfirmDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={() => handleStatusChange("completed")}
        title="Mark as Completed"
        message={`Are you sure you want to mark this withdrawal as completed? This will finalize the transaction.`}
        confirmText="Complete"
        cancelText="Cancel"
        type="info"
      />

      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={() => handleStatusChange("rejected")}
        title="Reject Withdrawal"
        message={`Are you sure you want to reject this withdrawal of ₦${withdrawal.amount.toLocaleString()}?`}
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}