'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { WithdrawalStatusBadge } from './WithdrawalStatusBadge';
import { DollarSign, Calendar } from 'lucide-react';

interface WithdrawalHistoryListProps {
  userId: string;
  limit?: number;
}

export function WithdrawalHistoryList({ userId, limit = 10 }: WithdrawalHistoryListProps) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading history...</div>;
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No withdrawal history yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {withdrawals.map((withdrawal) => (
        <div
          key={withdrawal.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">₦{withdrawal.amount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(withdrawal.created_at), 'PPP')}
              </p>
              {withdrawal.points_deducted && (
                <p className="text-xs text-muted-foreground">
                  {withdrawal.points_deducted} points deducted
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <WithdrawalStatusBadge status={withdrawal.status} />
            {withdrawal.rejection_reason && (
              <span className="text-xs text-red-600">
                ({withdrawal.rejection_reason})
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}