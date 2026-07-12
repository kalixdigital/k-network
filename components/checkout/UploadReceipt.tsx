"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Upload, X, FileImage, Loader2, CheckCircle } from "lucide-react";
import { showToast } from "@/components/ui/toast";

type UploadReceiptProps = {
  onUploaded: (path: string) => void;
};

export default function UploadReceipt({ onUploaded }: UploadReceiptProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      showToast.error("Please upload a PNG, JPG, JPEG, WEBP, or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast.error("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);

    // Create preview
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }

    // Upload immediately
    await uploadFile(selectedFile);
  };

  const uploadFile = async (fileToUpload: File) => {
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast.error("Please login to continue");
        setUploading(false);
        return;
      }

      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
      const filePath = `payment-receipts/${fileName}`;

      // Upload to payment-receipts bucket
      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(filePath, fileToUpload);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        
        // FIX: Safely check error properties without TypeScript errors
        const errorMessage = uploadError.message || "";
        const statusCode = (uploadError as any).statusCode;
        
        if (errorMessage.includes("bucket") || statusCode === 404) {
          showToast.error("Storage bucket not configured. Please contact support.");
        } else {
          showToast.error("Failed to upload receipt. Please try again.");
        }
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("payment-receipts")
        .getPublicUrl(filePath);

      onUploaded(filePath);
      showToast.success("Receipt uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      showToast.error("Failed to upload receipt. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploaded("");
  };

  // Format file name to fit in layout - shorter version
  const formatFileName = (name: string) => {
    if (name.length > 12) {
      const ext = name.split(".").pop();
      const baseName = name.substring(0, 9);
      return `${baseName}...${ext}`;
    }
    return name;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Upload Payment Receipt</h2>
      </div>

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-slate-700 p-8 text-center transition hover:border-emerald-500 hover:bg-slate-800/30"
        >
          <FileImage className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-2 text-sm text-slate-400">Click or drag to upload receipt</p>
          <p className="text-xs text-slate-500">PNG, JPG, JPEG, WEBP, PDF (Max 5MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-3">
            {preview ? (
              <img
                src={preview}
                alt="Receipt preview"
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800">
                <FileImage className="h-6 w-6 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {formatFileName(file.name)}
              </p>
              <p className="text-[10px] text-slate-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {uploading ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Uploading...</span>
                </div>
              ) : (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Uploaded
                </span>
              )}
            </div>
            <button
              onClick={removeFile}
              className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {file && (
        <p className="mt-2 text-[10px] text-slate-500">
          ✅ Receipt uploaded. Click submit order to complete your purchase.
        </p>
      )}
    </div>
  );
}