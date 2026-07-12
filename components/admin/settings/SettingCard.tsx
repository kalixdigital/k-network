"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Save, RefreshCw } from "lucide-react";

type SettingCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  onRefresh?: () => void;
};

export default function SettingCard({
  title,
  description,
  children,
  onSave,
  onRefresh,
}: SettingCardProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      showToast.success(`${title} saved successfully`);
    } catch (error: any) {
      console.error(`Error saving ${title}:`, error);
      const errorMessage = error?.message || error?.details || `Failed to save ${title}`;
      showToast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}