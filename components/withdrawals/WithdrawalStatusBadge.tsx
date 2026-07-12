'use client';

import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WithdrawalStatusBadgeProps {
  status: string;
  className?: string;
}

export function WithdrawalStatusBadge({ status, className = '' }: WithdrawalStatusBadgeProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    },
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    },
    processing: {
      icon: Loader2,
      label: 'Processing',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    },
    cancelled: {
      icon: XCircle,
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize inline-flex items-center gap-1.5 ${config.className} ${className}`}>
      <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}