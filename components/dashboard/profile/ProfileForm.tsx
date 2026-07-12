"use client";

import { useState } from "react";
import { Save, X, Loader2, Banknote, Users } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type ProfileFormProps = {
  profile: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
  userLevel?: number;
};

export default function ProfileForm({ 
  profile, 
  onSave, 
  onCancel, 
  saving, 
  userLevel = 1 
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    bank_name: profile?.bank_name || "",
    bank_account_number: profile?.bank_account_number || "",
    bank_account_name: profile?.bank_account_name || "",
    next_of_kin_name: profile?.next_of_kin_name || "",
    next_of_kin_phone: profile?.next_of_kin_phone || "",
    next_of_kin_relationship: profile?.next_of_kin_relationship || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  const levelBorder = levelData.borderColor;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Edit Profile (Bank & Next of Kin)</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 rounded-lg ${levelBg} px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className={`rounded-lg p-4 border ${levelBorder} bg-opacity-10`}>
        <p className={`text-sm ${levelColor} flex items-center gap-2`}>
          <span className="text-lg">ℹ️</span>
          Personal Information and Location are read-only. Please contact admin to update them.
        </p>
      </div>

      {/* Bank Details */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="mb-4 font-semibold text-white flex items-center gap-2">
          <Banknote className={`h-4 w-4 ${levelColor}`} />
          Bank Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-400">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border ${levelBorder} bg-slate-900/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900`}
              placeholder="e.g., GTBank"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Account Number</label>
            <input
              type="text"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border ${levelBorder} bg-slate-900/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900`}
              placeholder="0123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Account Name</label>
            <input
              type="text"
              name="bank_account_name"
              value={formData.bank_account_name}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border ${levelBorder} bg-slate-900/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900`}
              placeholder="Account holder name"
            />
          </div>
        </div>
      </div>

      {/* Next of Kin */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="mb-4 font-semibold text-white flex items-center gap-2">
          <Users className={`h-4 w-4 ${levelColor}`} />
          Next of Kin
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-400">Full Name</label>
            <input
              type="text"
              name="next_of_kin_name"
              value={formData.next_of_kin_name}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border ${levelBorder} bg-slate-900/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900`}
              placeholder="Next of kin full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Phone Number</label>
            <input
              type="tel"
              name="next_of_kin_phone"
              value={formData.next_of_kin_phone}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border ${levelBorder} bg-slate-900/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900`}
              placeholder="08012345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Relationship</label>
            <input
              type="text"
              name="next_of_kin_relationship"
              value={formData.next_of_kin_relationship}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border ${levelBorder} bg-slate-900/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900`}
              placeholder="e.g., Spouse, Child, Parent"
            />
          </div>
        </div>
      </div>
    </form>
  );
}