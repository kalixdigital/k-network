"use client";

import { useState, useRef } from "react";
import { Upload, Check, X, File, Image } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

type Props = {
  onUploaded: (path: string) => void;
};

export default function UploadReceipt({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent page reload and event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files?.[0];

    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("File size exceeds 5MB limit");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      showToast.error("Please upload a JPEG, PNG, GIF, or PDF file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Get file extension and create display name
    const fileExtension = file.name.split('.').pop() || '';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
    const truncatedName = baseName.length > 20 ? baseName.substring(0, 20) + '...' : baseName;
    const displayName = `${truncatedName}.${fileExtension}`;

    setFileName(displayName);
    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("payment-receipts")
        .upload(fileName, file);

      if (error) {
        console.error("Supabase storage error:", error);
        if (error.message?.includes("bucket")) {
          showToast.error("Storage bucket not configured. Please contact support.");
        } else if (error.message?.includes("permission")) {
          showToast.error("Permission denied. Please contact support.");
        } else {
          showToast.error(error.message || "Failed to upload receipt");
        }
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setUploaded(true);
      
      if (typeof onUploaded === 'function') {
        onUploaded(fileName);
      } else {
        console.error("onUploaded is not a function", onUploaded);
        showToast.error("Upload callback error");
      }
      
      showToast.success("Receipt uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      let errorMessage = "Failed to upload receipt";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      showToast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFileName("");
    setUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (typeof onUploaded === 'function') {
      onUploaded("");
    }
  };

  // ✅ Fix: Use React.DragEvent<HTMLLabelElement>
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Simulate file input change
    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  // Get file icon based on type
  const getFileIcon = () => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <Image className="h-5 w-5 text-emerald-400" />;
    }
    return <File className="h-5 w-5 text-emerald-400" />;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <h2 className="text-xl font-bold text-white">Upload Payment Receipt</h2>
      <p className="mt-1 text-sm text-slate-400">Upload a clear screenshot or PDF of your payment</p>

      {!uploaded ? (
        <div className="mt-4">
          <label
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-8 transition hover:border-emerald-500/50 hover:bg-slate-800"
          >
            <Upload className="h-10 w-10 text-slate-400" />
            <span className="mt-2 text-sm text-slate-400">
              Click to upload or drag and drop
            </span>
            <span className="mt-1 text-xs text-slate-500">
              JPEG, PNG, GIF, PDF (max 5MB)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={uploadReceipt}
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {uploading && (
            <div className="mt-3 flex items-center justify-center gap-2 text-emerald-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <span>Uploading...</span>
            </div>
          )}

          {fileName && !uploading && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="truncate text-sm text-white">{fileName}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-red-400 hover:text-red-300"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">Receipt uploaded</p>
              <p className="truncate text-sm text-slate-400" title={fileName}>
                {fileName}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFile();
              }}
              className="flex-shrink-0 text-red-400 hover:text-red-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}