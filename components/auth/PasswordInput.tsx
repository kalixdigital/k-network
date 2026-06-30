"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import PasswordStrength from "@/components/form/PasswordStrength";

interface FormPasswordProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  showStrength?: boolean;
}

export default function FormPassword({
  label,
  value,
  onChange,
  error,
  placeholder,
  showStrength = false,
}: FormPasswordProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">

      <Label>{label}</Label>

      <div className="relative">

        <Input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 pr-12"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

      </div>

      {showStrength && (
        <PasswordStrength password={value} />
      )}

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}
