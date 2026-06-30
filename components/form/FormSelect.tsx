"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

interface FormSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}

export default function FormSelect({
  label,
  placeholder,
  value,
  onValueChange,
  options,
}: FormSelectProps) {
  return (
    <div className="space-y-2">

      <Label>{label}</Label>

      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>

          {options.map((item) => (
            <SelectItem
              key={item}
              value={item}
            >
              {item}
            </SelectItem>
          ))}

        </SelectContent>

      </Select>

    </div>
  );
}
