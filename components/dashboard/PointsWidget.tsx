'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function PointsWidget({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSummary();
    }
  }, [userId]);

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_monthly_points_summary', {
          p_user_id: userId
        });
      if (error) throw error;
      setSummary(data);
    } catch (error) {
      console.error('Error fetching points summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-muted rounded mb-2"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Points Summary</span>
          <Link href="/dashboard/points-engine">
            <Button variant="ghost" size="sm" className="text-xs">
              View Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{summary?.total_points || 0}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Naira Value</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ₦{summary?.naira_equivalent?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                1pt = ₦{summary?.points_to_naira_rate || 10}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Status</span>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium ${
                summary?.status === 'pending_withdrawal' ? 'text-yellow-600' :
                summary?.status === 'accumulating' ? 'text-blue-600' :
                'text-gray-500'
              }`}>
                {summary?.status === 'pending_withdrawal' ? 'Ready for Withdrawal' :
                 summary?.status === 'accumulating' ? 'Accumulating' : 'No Points'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}