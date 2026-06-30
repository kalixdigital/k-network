import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FormInput({
  label,
  error,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-200">
        {label}
      </Label>

      <Input
        className={`h-12 w-full rounded-xl border-slate-700 bg-slate-950 focus-visible:ring-emerald-500 ${className ?? ""}`}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
