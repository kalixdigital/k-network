// components/admin/genealogy/GenealogySearch.tsx
'use client';

import { Search } from 'lucide-react';

interface GenealogySearchProps {
  value: string;
  onChange: (value: string) => void;
  totalMembers: number;
}

export default function GenealogySearch({
  value,
  onChange,
  totalMembers,
}: GenealogySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
      <input
        type="text"
        placeholder="Search by name, email, or member ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>
      )}
    </div>
  );
}