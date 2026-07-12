'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { WithdrawalCard } from '@/components/withdrawals/WithdrawalCard';
import { WithdrawalStats } from '@/components/withdrawals/WithdrawalStats';
import { toast } from 'sonner';

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
  profile_bank_name: string;
  profile_account_number: string;
  profile_account_name: string;
}

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('admin_get_withdrawal_requests', {
          p_status: filter === 'all' ? null : filter
        });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (withdrawalId: string, action: 'approve' | 'reject' | 'complete') => {
    setIsProcessing(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .rpc('admin_process_withdrawal', {
          p_withdrawal_id: withdrawalId,
          p_admin_id: userData?.user?.id,
          p_action: action,
          p_rejection_reason: action === 'reject' ? rejectionReason : null
        });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || `Withdrawal ${action}d successfully`);
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedRequest(null);
        await fetchRequests();
      } else {
        toast.error(data?.error || `Failed to ${action} withdrawal`);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved' || r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalAmount: requests.reduce((sum, r) => sum + r.amount, 0),
  };

  // Render actions based on status
  const renderActions = (request: WithdrawalRequest) => {
    if (request.status === 'pending') {
      return (
        <>
          <Button
            size="sm"
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => handleAction(request.id, 'approve')}
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => {
              setSelectedRequest(request);
              setShowRejectModal(true);
            }}
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </>
      );
    }

    if (request.status === 'approved') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
          onClick={() => handleAction(request.id, 'complete')}
          disabled={isProcessing}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Mark Complete
        </Button>
      );
    }

    if (request.status === 'processing') {
      return <span className="text-sm text-muted-foreground">Processing...</span>;
    }

    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Withdrawal Management</h1>
            <p className="text-muted-foreground">
              Review and process user withdrawal requests
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <WithdrawalStats stats={stats} />

        {/* Tabs */}
        <Tabs defaultValue="pending" onValueChange={setFilter}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {stats.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs">
                    {stats.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-muted-foreground">No withdrawal requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <WithdrawalCard
                        key={request.id}
                        withdrawal={request}
                        actions={renderActions(request)}
                        showUser={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Reject Withdrawal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Reject withdrawal request from {selectedRequest.full_name} for ₦{selectedRequest.amount.toLocaleString()}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reason for Rejection
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(selectedRequest.id, 'reject')}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Reject Withdrawal'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}