// app/(member)/dashboard/points-engine/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AccessGuard } from '@/components/AccessGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Banknote,
  CheckCircle,
  Loader2,
  Coins,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { WithdrawalStatusBadge } from '@/components/withdrawals/WithdrawalStatusBadge';
import { WithdrawalHistoryList } from '@/components/withdrawals/WithdrawalHistoryList';
// Import from the correct path - these should be in @/components/ui/
import { LevelBadge } from '@/components/ui/LevelBadge';
import { LevelCard } from '@/components/ui/LevelCard';
import { LevelStats } from '@/components/ui/LevelStats';
import { getLevel } from '@/lib/constants/levels';
import { toast } from 'sonner';
import { showToast } from "@/components/ui/toast";

// Types matching your database schema
interface PointsSummary {
  user_id: string;
  month: number;
  year: number;
  total_points: number;
  naira_equivalent: number;
  points_to_naira_rate: number;
  reset_day: number;
  cutoff_date: string;
  payment_date: string;
  is_cutoff_passed: boolean;
  status: string;
  bank_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  message: string;
}

interface PendingWithdrawal {
  id: string;
  amount: number;
  points_deducted: number;
  status: string;
  created_at: string;
  rejection_reason?: string;
}

const MIN_LEVEL_REQUIRED = 2;

function PointsEngineContent() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Get user's membership level
        const { data: profile } = await supabase
          .from('profiles')
          .select('membership_level')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserLevel(profile.membership_level || 1);
        }
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPointsData();
    }
  }, [userId]);

  const fetchPointsData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_user_monthly_points_summary', {
          p_user_id: userId
        });

      if (summaryError) throw summaryError;
      setSummary(summaryData);

      const { data: withdrawalData, error: withdrawalError } = await supabase
        .rpc('get_user_withdrawal_status', {
          p_user_id: userId
        });

      if (withdrawalError) throw withdrawalError;
      setPendingWithdrawals(withdrawalData?.pending_withdrawals || []);
    } catch (error) {
      console.error('Error fetching points data:', error);
      toast.error('Failed to load points data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!userId) return;
    
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsWithdrawing(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase
        .rpc('request_withdrawal', {
          p_user_id: userId,
          p_amount: amount,
          p_payment_method: 'bank_transfer'
        });

      if (error) throw error;

      if (data?.success) {
        setSuccess(data.message || 'Withdrawal request submitted successfully!');
        setWithdrawAmount('');
        toast.success('Withdrawal request submitted!');
        await fetchPointsData();
      } else {
        setError(data?.error || 'Failed to submit withdrawal request');
        toast.error(data?.error || 'Failed to submit withdrawal request');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const level = getLevel(userLevel);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header with Level Badge */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">Points Engine</h1>
              <LevelBadge levelId={userLevel} />
            </div>
            <p className="text-gray-400">
              Track your monthly points and manage withdrawals
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
              Reset Day: {summary?.reset_day || 23}rd of each month
            </span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Main Stats - Using LevelStats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <LevelStats
            levelId={userLevel}
            label="Total Points (This Month)"
            value={summary?.total_points?.toLocaleString() || 0}
            icon={<Coins className="h-5 w-5" />}
            className="bg-gray-800/50 border-gray-700"
          />

          <LevelStats
            levelId={userLevel}
            label="Naira Equivalent"
            value={`₦${summary?.naira_equivalent?.toLocaleString() || 0}`}
            icon={<DollarSign className="h-5 w-5" />}
            className="bg-gray-800/50 border-gray-700"
          />

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Status</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  summary?.status === 'pending_withdrawal' ? 'bg-yellow-500' :
                  summary?.status === 'accumulating' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <span className={`text-sm font-medium capitalize ${
                  summary?.status === 'pending_withdrawal' ? 'text-yellow-400' :
                  summary?.status === 'accumulating' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  {summary?.status === 'pending_withdrawal' ? 'Ready for Withdrawal' :
                   summary?.status === 'accumulating' ? 'Accumulating' : 'No Points'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary?.message}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Bank Details</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {summary?.bank_details?.bank_name ? (
                <div>
                  <p className="text-sm font-medium text-white">{summary.bank_details.bank_name}</p>
                  <p className="text-xs text-gray-400">
                    {summary.bank_details.account_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {summary.bank_details.account_number}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-400">
                  No bank details found. Please update your profile.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cutoff Info */}
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-400">Monthly Cutoff: {summary?.reset_day || 23}rd</p>
                  <p className="text-sm text-gray-400">
                    Points stop accumulating on the {summary?.reset_day || 23}rd of each month.
                    Payment starts from {summary?.payment_date ? format(new Date(summary.payment_date), 'do MMMM') : '25th'} onward.
                  </p>
                  {summary?.is_cutoff_passed && summary?.total_points > 0 && (
                    <p className="text-sm text-emerald-400 font-medium mt-1">
                      ✅ Points locked for this month. You can request withdrawal.
                    </p>
                  )}
                  {summary?.is_cutoff_passed && summary?.total_points === 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      ⏰ No points accumulated this month.
                    </p>
                  )}
                  {!summary?.is_cutoff_passed && (
                    <p className="text-sm text-blue-400 font-medium mt-1">
                      ⏳ Points are being accumulated until {format(new Date(summary?.cutoff_date || new Date()), 'do MMMM')}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-sm bg-gray-800/50 px-4 py-2 rounded-lg shadow-sm border border-gray-700">
                <span className="text-gray-400">Next Cycle Starts: </span>
                <span className="text-white font-medium">
                  {summary?.is_cutoff_passed ? 
                    format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, (summary?.reset_day || 23) + 1), 'do MMMM') :
                    format(new Date(new Date().getFullYear(), new Date().getMonth(), (summary?.reset_day || 23) + 1), 'do MMMM')
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        {summary?.is_cutoff_passed && summary?.total_points > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Request Withdrawal</CardTitle>
              <CardDescription className="text-gray-400">
                Enter the amount you want to withdraw. Points will be deducted from your balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount in Naira"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-500"
                    disabled={isWithdrawing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: ₦{Math.floor(summary.total_points * (summary.points_to_naira_rate || 10))}
                  </p>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || pendingWithdrawals.length > 0}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : pendingWithdrawals.length > 0 ? (
                      'Withdrawal Pending'
                    ) : (
                      'Request Withdrawal'
                    )}
                  </Button>
                </div>
              </div>
              {pendingWithdrawals.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-400">
                    You have {pendingWithdrawals.length} pending withdrawal(s). Please wait for them to be processed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Withdrawals */}
        {pendingWithdrawals.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pending Withdrawals</CardTitle>
              <CardDescription className="text-gray-400">
                Your withdrawal requests awaiting processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        withdrawal.status === 'pending' ? 'bg-yellow-500/20' :
                        withdrawal.status === 'approved' ? 'bg-blue-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        {withdrawal.status === 'pending' && <Clock className="h-4 w-4 text-yellow-400" />}
                        {withdrawal.status === 'approved' && <CheckCircle className="h-4 w-4 text-blue-400" />}
                        {withdrawal.status === 'processing' && <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">₦{withdrawal.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">
                          {withdrawal.points_deducted} points deducted
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested: {format(new Date(withdrawal.created_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <WithdrawalStatusBadge status={withdrawal.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal History */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Withdrawal History</CardTitle>
            <CardDescription className="text-gray-400">
              View all your past withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WithdrawalHistoryList userId={userId || ''} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PointsEnginePage() {
  return (
    <AccessGuard minLevel={MIN_LEVEL_REQUIRED}>
      <PointsEngineContent />
    </AccessGuard>
  );
}