'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  DollarSign, 
  Banknote, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { createNotification, NotificationTemplates, getAdminUsers } from '@/lib/services/notificationService';

interface WithdrawalDetailsProps {
  id: string;
}

interface WithdrawalDetail {
  id: string;
  user_id: string;
  full_name: string;
  id_number: string;
  email: string;
  amount: number;
  points_deducted: number;
  payment_method: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  status: string;
  notes: string;
  requested_at: string;
  processed_at: string;
  completed_at: string;
  rejection_reason?: string;
  metadata: any;
  profile_bank_name: string;
  profile_account_number: string;
  profile_account_name: string;
}

export default function WithdrawalDetails({ id }: WithdrawalDetailsProps) {
  const router = useRouter();
  const [withdrawal, setWithdrawal] = useState<WithdrawalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminId(user.id);
      }
    };
    getAdmin();
  }, []);

  useEffect(() => {
    if (id && adminId !== null) {
      fetchWithdrawal();
    }
  }, [id, adminId]);

  const fetchWithdrawal = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('admin_get_withdrawal_requests', {
          p_status: null
        });

      if (error) throw error;
      
      const found = data?.find((w: any) => w.id === id);
      if (found) {
        setWithdrawal(found);
      } else {
        showToast.error('Withdrawal not found');
        router.push('/admin/withdrawals');
      }
    } catch (error: any) {
      console.error('Error fetching withdrawal:', error);
      showToast.error(error.message || 'Failed to load withdrawal details');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SEND NOTIFICATIONS HELPERS
  // ============================================
  
  const sendUserNotification = async (userId: string, title: string, description: string, type: string, metadata: any) => {
    try {
      await createNotification({
        userId,
        title,
        description,
        type: type as any,
        metadata,
      });
      console.log(`✅ User notification sent: ${title}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send user notification:", error);
      return false;
    }
  };

  const sendAdminNotifications = async (title: string, description: string, metadata: any) => {
    try {
      const admins = await getAdminUsers();
      
      if (!admins || admins.length === 0) {
        console.log("⚠️ No admins found to notify");
        return;
      }

      let successCount = 0;
      for (const admin of admins) {
        try {
          await createNotification({
            userId: admin.id,
            title,
            description,
            type: "system",
            metadata,
          });
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to notify admin ${admin.email}:`, error);
        }
      }
      
      console.log(`✅ Notified ${successCount} admin(s)`);
    } catch (error) {
      console.error("❌ Failed to send admin notifications:", error);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'complete') => {
    if (!adminId || !withdrawal) return;

    setProcessing(true);
    
    try {
      const { data, error } = await supabase
        .rpc('admin_process_withdrawal', {
          p_withdrawal_id: withdrawal.id,
          p_admin_id: adminId,
          p_action: action,
          p_rejection_reason: null
        });

      if (error) throw error;

      if (data?.success) {
        showToast.success(data.message || `Withdrawal ${action}d successfully`);

        // ============================================
        // SEND NOTIFICATIONS BASED ON ACTION
        // ============================================

        // 1. WITHDRAWAL APPROVED
        if (action === 'approve') {
          // User notification
          await sendUserNotification(
            withdrawal.user_id,
            "Withdrawal Approved! ✅",
            `Your withdrawal request of ₦${withdrawal.amount.toLocaleString()} has been approved and is being processed.`,
            "withdrawal",
            {
              withdrawal_id: withdrawal.id,
              amount: withdrawal.amount,
              status: "approved",
            }
          );

          // Admin notification (status update)
          await sendAdminNotifications(
            "Withdrawal Approved 💰",
            `Withdrawal request of ₦${withdrawal.amount.toLocaleString()} from ${withdrawal.full_name} has been approved.`,
            {
              withdrawal_id: withdrawal.id,
              amount: withdrawal.amount,
              user: withdrawal.full_name,
              status: "approved",
            }
          );
        }

        // 2. WITHDRAWAL COMPLETED
        else if (action === 'complete') {
          // User notification
          await sendUserNotification(
            withdrawal.user_id,
            "Withdrawal Completed! 🎉",
            `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} has been completed. Please check your account.`,
            "withdrawal",
            {
              withdrawal_id: withdrawal.id,
              amount: withdrawal.amount,
              status: "completed",
            }
          );

          // Admin notification
          await sendAdminNotifications(
            "Withdrawal Completed ✅",
            `Withdrawal of ₦${withdrawal.amount.toLocaleString()} to ${withdrawal.full_name} has been completed.`,
            {
              withdrawal_id: withdrawal.id,
              amount: withdrawal.amount,
              user: withdrawal.full_name,
              status: "completed",
            }
          );
        }

        // 3. WITHDRAWAL REJECTED
        else if (action === 'reject') {
          // User notification
          await sendUserNotification(
            withdrawal.user_id,
            "Withdrawal Rejected ❌",
            `Your withdrawal request of ₦${withdrawal.amount.toLocaleString()} has been rejected. Please contact support for more information.`,
            "withdrawal",
            {
              withdrawal_id: withdrawal.id,
              amount: withdrawal.amount,
              status: "rejected",
            }
          );

          // Admin notification
          await sendAdminNotifications(
            "Withdrawal Rejected ❌",
            `Withdrawal request of ₦${withdrawal.amount.toLocaleString()} from ${withdrawal.full_name} has been rejected.`,
            {
              withdrawal_id: withdrawal.id,
              amount: withdrawal.amount,
              user: withdrawal.full_name,
              status: "rejected",
            }
          );
        }

        await fetchWithdrawal();
      } else {
        showToast.error(data?.error || `Failed to ${action} withdrawal`);
      }
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      showToast.error(error.message || 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      approved: 'bg-blue-500/20 text-blue-500',
      processing: 'bg-purple-500/20 text-purple-500',
      completed: 'bg-green-500/20 text-green-500',
      rejected: 'bg-red-500/20 text-red-500',
      cancelled: 'bg-gray-500/20 text-gray-500'
    };
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="text-center py-12 px-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">Withdrawal Not Found</h3>
        <p className="text-sm text-slate-400 mt-1">The withdrawal you're looking for doesn't exist.</p>
        <Link href="/admin/withdrawals">
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Withdrawals
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/admin/withdrawals">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white px-2 md:px-3">
              <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-white">Withdrawal Details</h1>
            <p className="text-xs md:text-sm text-slate-400 hidden sm:block">View and manage withdrawal request</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(withdrawal.status)}`}>
            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWithdrawal}
            className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-xs md:text-sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Info Grid - Stack on mobile */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Member Info */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-slate-400 mb-3 md:mb-4 flex items-center gap-2">
            <User className="h-3 w-3 md:h-4 md:w-4" />
            Member Information
          </h3>
          <div className="space-y-2 md:space-y-3">
            <div>
              <p className="text-[10px] md:text-xs text-slate-500">Full Name</p>
              <p className="text-sm md:text-base text-white font-medium break-words">{withdrawal.full_name}</p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-500">Member ID</p>
              <p className="text-sm md:text-base text-white font-medium">#{withdrawal.id_number}</p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-500">Email</p>
              <p className="text-sm md:text-base text-white font-medium flex items-center gap-2 break-all">
                <Mail className="h-3 w-3 md:h-4 md:w-4 text-slate-500 flex-shrink-0" />
                <span className="break-words">{withdrawal.email}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-500">Requested</p>
              <p className="text-sm md:text-base text-white font-medium flex items-center gap-2">
                <Calendar className="h-3 w-3 md:h-4 md:w-4 text-slate-500 flex-shrink-0" />
                <span className="text-xs md:text-sm">{format(new Date(withdrawal.requested_at), 'PPP pp')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawal Info */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-slate-400 mb-3 md:mb-4 flex items-center gap-2">
            <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
            Withdrawal Information
          </h3>
          <div className="space-y-2 md:space-y-3">
            <div>
              <p className="text-[10px] md:text-xs text-slate-500">Amount</p>
              <p className="text-xl md:text-2xl font-bold text-emerald-400">
                ₦{withdrawal.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-500">Points Deducted</p>
              <p className="text-sm md:text-base text-white font-medium">{withdrawal.points_deducted} points</p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-500">Payment Method</p>
              <p className="text-sm md:text-base text-white font-medium capitalize">{withdrawal.payment_method}</p>
            </div>
            {withdrawal.metadata?.month && withdrawal.metadata?.year && (
              <div>
                <p className="text-[10px] md:text-xs text-slate-500">Period</p>
                <p className="text-sm md:text-base text-white font-medium">
                  {withdrawal.metadata.month}/{withdrawal.metadata.year}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Details - Responsive grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
        <h3 className="text-xs md:text-sm font-medium text-slate-400 mb-3 md:mb-4 flex items-center gap-2">
          <Banknote className="h-3 w-3 md:h-4 md:w-4" />
          Bank Details
        </h3>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-[10px] md:text-xs text-slate-500">Bank Name</p>
            <p className="text-sm md:text-base text-white font-medium break-words">
              {withdrawal.bank_name || withdrawal.profile_bank_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-500">Account Name</p>
            <p className="text-sm md:text-base text-white font-medium break-words">
              {withdrawal.account_name || withdrawal.profile_account_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-500">Account Number</p>
            <p className="text-sm md:text-base text-white font-medium break-words">
              {withdrawal.account_number || withdrawal.profile_account_number || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Notes & Rejection Reason */}
      {(withdrawal.notes || withdrawal.rejection_reason) && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-slate-400 mb-3 md:mb-4">Additional Information</h3>
          {withdrawal.notes && (
            <div className="mb-3">
              <p className="text-[10px] md:text-xs text-slate-500">Notes</p>
              <p className="text-sm md:text-base text-white break-words">{withdrawal.notes}</p>
            </div>
          )}
          {withdrawal.rejection_reason && (
            <div>
              <p className="text-[10px] md:text-xs text-red-400">Rejection Reason</p>
              <p className="text-sm md:text-base text-red-300 break-words">{withdrawal.rejection_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
        <h3 className="text-xs md:text-sm font-medium text-slate-400 mb-3 md:mb-4 flex items-center gap-2">
          <Clock className="h-3 w-3 md:h-4 md:w-4" />
          Timeline
        </h3>
        <div className="space-y-2 md:space-y-3">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between py-2 border-b border-slate-800 gap-1 xs:gap-0">
            <span className="text-xs md:text-sm text-slate-400">Requested</span>
            <span className="text-xs md:text-sm text-white">
              {format(new Date(withdrawal.requested_at), 'PPP pp')}
            </span>
          </div>
          {withdrawal.processed_at && (
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between py-2 border-b border-slate-800 gap-1 xs:gap-0">
              <span className="text-xs md:text-sm text-slate-400">Processed</span>
              <span className="text-xs md:text-sm text-white">
                {format(new Date(withdrawal.processed_at), 'PPP pp')}
              </span>
            </div>
          )}
          {withdrawal.completed_at && (
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between py-2 gap-1 xs:gap-0">
              <span className="text-xs md:text-sm text-slate-400">Completed</span>
              <span className="text-xs md:text-sm text-white">
                {format(new Date(withdrawal.completed_at), 'PPP pp')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions - Stack on mobile */}
      {withdrawal.status === 'pending' && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 pt-4 border-t border-slate-800">
          <Button
            onClick={() => handleAction('approve')}
            disabled={processing}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Approve Withdrawal
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction('reject')}
            disabled={processing}
            className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500/10 text-sm md:text-base"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reject Withdrawal
          </Button>
        </div>
      )}

      {withdrawal.status === 'approved' && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 pt-4 border-t border-slate-800">
          <Button
            onClick={() => handleAction('complete')}
            disabled={processing}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Mark as Completed
          </Button>
        </div>
      )}
    </div>
  );
}