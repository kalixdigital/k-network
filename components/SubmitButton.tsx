"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  loading: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({
  loading,
  children,
}: Props) {
  return (
    <Button
      type="submit"
      className="w-full h-12"
      disabled={loading}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}

      {children}
    </Button>
  );
}
