"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

export default function FormCheckbox({
  checked,
  onCheckedChange,
  label,
}: Props) {
  return (
    <div className="flex items-center gap-3">

      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />

      <Label>{label}</Label>

    </div>
  );
}
