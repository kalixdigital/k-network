"use client";

import { Progress } from "@/components/ui/progress";
import { getPasswordStrength } from "@/lib/password-strength";

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({
  password,
}: PasswordStrengthProps) {
  const score = getPasswordStrength(password);

  const percentage = score * 20;

  const labels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Excellent",
  ];

  return (
    <div className="space-y-2">
      <Progress value={percentage} />

      <p className="text-xs text-slate-400">
        Strength: {labels[score]}
      </p>
    </div>
  );
}
