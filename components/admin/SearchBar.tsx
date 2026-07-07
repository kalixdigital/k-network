"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
};

export default function SearchBar({ placeholder = "Search...", onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    if (onClear) onClear();
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}