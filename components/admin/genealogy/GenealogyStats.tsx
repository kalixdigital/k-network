// components/admin/genealogy/GenealogyStats.tsx
'use client';

import { Users, CheckCircle, XCircle, UserCheck, GitBranch } from 'lucide-react';
import type { GenealogyStats } from './types';

interface GenealogyStatsProps {
  stats: GenealogyStats;
}

export default function GenealogyStats({ stats }: GenealogyStatsProps) {
  const statItems = [
    {
      label: 'Total Members',
      value: stats.total,
      icon: Users,
      color: 'text-white',
      bg: 'bg-slate-700/30',
    },
    {
      label: 'Verified',
      value: stats.verified,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: XCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: UserCheck,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Root Members',
      value: stats.rootMembers,
      icon: GitBranch,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`rounded-xl ${item.bg} border border-slate-700/50 p-3 sm:p-4 text-center transition hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${item.color}`} />
              <p className={`text-lg sm:text-xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}