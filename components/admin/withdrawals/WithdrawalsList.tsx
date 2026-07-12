'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable from '@/components/admin/DataTable';
import { showToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface WithdrawalRequest {
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
  metadata: any;
  rejection_reason?: string;
  profile_bank_name: string;
  profile_account_number: string;
  profile_account_name: string;
}

export default function WithdrawalsList() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
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
    if (adminId) {
      fetchWithdrawals();
    }
  }, [adminId]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('admin_get_withdrawal_requests', {
          p_status: null
        });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      showToast.error(error.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (withdrawalId: string, action: 'approve' | 'reject' | 'complete') => {
    if (!adminId) {
      showToast.error('Admin authentication required');
      return;
    }

    setProcessingId(withdrawalId);
    
    try {
      const { data, error } = await supabase
        .rpc('admin_process_withdrawal', {
          p_withdrawal_id: withdrawalId,
          p_admin_id: adminId,
          p_action: action,
          p_rejection_reason: null
        });

      if (error) throw error;

      if (data?.success) {
        showToast.success(data.message || `Withdrawal ${action}d successfully`);
        await fetchWithdrawals();
      } else {
        showToast.error(data?.error || `Failed to ${action} withdrawal`);
      }
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      showToast.error(error.message || 'An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
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

  // Define columns matching your DataTable structure
  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (row: WithdrawalRequest) => (
        <div>
          <p className="font-medium text-white">{row.full_name}</p>
          <p className="text-sm text-slate-400">{row.id_number}</p>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row: WithdrawalRequest) => (
        <div>
          <p className="font-semibold text-emerald-400">₦{row.amount.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{row.points_deducted} points</p>
        </div>
      )
    },
    {
      key: 'bank',
      header: 'Bank Details',
      render: (row: WithdrawalRequest) => (
        <div>
          <p className="text-sm text-white">{row.bank_name || row.profile_bank_name || 'N/A'}</p>
          <p className="text-xs text-slate-400">{row.account_number || row.profile_account_number || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: WithdrawalRequest) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (row: WithdrawalRequest) => (
        <div>
          <p className="text-sm text-white">{format(new Date(row.requested_at), 'dd/MM/yyyy')}</p>
          <p className="text-xs text-slate-500">{format(new Date(row.requested_at), 'hh:mm a')}</p>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: WithdrawalRequest) => {
        const isProcessing = processingId === row.id;
        
        return (
          <div className="flex items-center gap-2">
            {/* View Details */}
            <Link href={`/admin/withdrawals/${row.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>

            {/* Approve - Only for pending */}
            {row.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(row.id, 'approve')}
                disabled={isProcessing}
                className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                title="Approve"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Reject - Only for pending */}
            {row.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(row.id, 'reject')}
                disabled={isProcessing}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                title="Reject"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Complete - Only for approved */}
            {row.status === 'approved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(row.id, 'complete')}
                disabled={isProcessing}
                className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                title="Mark Complete"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="w-full">
      <DataTable
        data={withdrawals}
        columns={columns}
        loading={loading}
        emptyMessage="No withdrawal requests found"
      />
    </div>
  );
}