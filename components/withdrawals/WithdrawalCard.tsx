'use client';

import { Banknote, Calendar, User, Mail, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { WithdrawalStatusBadge } from './WithdrawalStatusBadge';

interface WithdrawalCardProps {
  withdrawal: {
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
    metadata?: any;
    rejection_reason?: string;
  };
  actions?: React.ReactNode;
  showUser?: boolean;
}

export function WithdrawalCard({ withdrawal, actions, showUser = true }: WithdrawalCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {showUser && (
                  <>
                    <h3 className="font-semibold">{withdrawal.full_name}</h3>
                    <span className="text-xs text-muted-foreground">
                      #{withdrawal.id_number}
                    </span>
                  </>
                )}
                <WithdrawalStatusBadge status={withdrawal.status} />
              </div>
              {showUser && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {withdrawal.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Banknote className="h-3 w-3" />
                    {withdrawal.bank_name || 'N/A'}
                  </span>
                  <span>•</span>
                  <span>{withdrawal.account_number || 'N/A'}</span>
                </div>
              )}
              {!showUser && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Banknote className="h-3 w-3" />
                    {withdrawal.bank_name || 'N/A'}
                  </span>
                  <span>•</span>
                  <span>
                    {withdrawal.account_name || 'N/A'} ({withdrawal.account_number || 'N/A'})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amount and Points */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              ₦{withdrawal.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {withdrawal.points_deducted} points
            </p>
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Additional Info */}
      {(withdrawal.notes || withdrawal.metadata || withdrawal.rejection_reason) && (
        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground space-y-1">
          {withdrawal.notes && (
            <p><span className="font-medium">Notes:</span> {withdrawal.notes}</p>
          )}
          {withdrawal.rejection_reason && (
            <p className="text-red-600">
              <span className="font-medium">Rejection Reason:</span> {withdrawal.rejection_reason}
            </p>
          )}
          {withdrawal.metadata && (
            <p className="text-xs">
              <span className="font-medium">Period:</span>{' '}
              {withdrawal.metadata?.month}/{withdrawal.metadata?.year}
              {withdrawal.metadata?.cutoff_date && (
                <> • Cutoff: {format(new Date(withdrawal.metadata.cutoff_date), 'PP')}</>
              )}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 inline mr-1" />
            Requested: {format(new Date(withdrawal.requested_at), 'PPP')}
          </p>
        </div>
      )}
    </div>
  );
}