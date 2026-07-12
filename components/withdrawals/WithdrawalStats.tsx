'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface WithdrawalStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
    totalAmount: number;
  };
}

export function WithdrawalStats({ stats }: WithdrawalStatsProps) {
  const statItems = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: Users,
      color: 'text-muted-foreground',
      border: ''
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-blue-600',
      border: 'border-blue-200'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      border: 'border-green-200'
    },
    {
      title: 'Total Amount',
      value: `₦${stats.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      border: ''
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statItems.map((item, index) => (
        <Card key={index} className={item.border}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}