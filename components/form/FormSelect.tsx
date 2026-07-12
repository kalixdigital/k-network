"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function FormSelect({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  required = false,
  disabled = false,
  className = "",
  error = "",
}: FormSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-200">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </Label>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "h-12 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 text-white transition hover:bg-slate-800/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            disabled && "cursor-not-allowed opacity-50 hover:bg-slate-900/50"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="border border-slate-700 bg-slate-900/95 backdrop-blur-xl">
          {options.map((item) => (
            <SelectItem
              key={item}
              value={item}
              className="text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
            >
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!error && (
        <p className="text-xs text-slate-500">
          Select an option from the dropdown
        </p>
      )}
    </div>
  );
}