"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Props = {
  onUploaded: (path: string) => void;
};

export default function UploadReceipt({
  onUploaded,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const uploadReceipt = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("payment-receipts")
      .upload(fileName, file);

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onUploaded(fileName);

    alert("Receipt uploaded successfully.");
  };

  return (
    <div className="rounded-2xl bg-slate-900 p-6">

      <h2 className="text-xl font-bold text-white">
        Upload Payment Receipt
      </h2>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={uploadReceipt}
        className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
      />

      {uploading && (
        <p className="mt-3 text-emerald-400">
          Uploading...
        </p>
      )}

    </div>
  );
}
