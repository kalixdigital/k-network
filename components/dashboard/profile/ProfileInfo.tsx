"use client";

import { User, Mail, Phone, MapPin, Calendar, Building, Banknote, Users, Lock } from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

type ProfileInfoProps = {
  profile: any;
  userLevel?: number;
};

export default function ProfileInfo({ profile, userLevel = 1 }: ProfileInfoProps) {
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  const levelBorder = levelData.borderColor;

  const infoSections = [
    {
      title: "Personal Information",
      icon: User,
      editable: false,
      fields: [
        { label: "Full Name", value: profile.full_name },
        { label: "Email", value: profile.email },
        { label: "Phone", value: profile.phone || "Not set" },
        { label: "Gender", value: profile.gender || "Not set" },
        { label: "Date of Birth", value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "Not set" },
      ],
    },
    {
      title: "Location",
      icon: MapPin,
      editable: false,
      fields: [
        { label: "Country", value: profile.country || "Not set" },
        { label: "State", value: profile.state || "Not set" },
        { label: "Address", value: profile.address || "Not set" },
      ],
    },
    {
      title: "Bank Details",
      icon: Banknote,
      editable: true,
      fields: [
        { label: "Bank Name", value: profile.bank_name || "Not set" },
        { label: "Account Number", value: profile.bank_account_number || "Not set" },
        { label: "Account Name", value: profile.bank_account_name || "Not set" },
      ],
    },
    {
      title: "Next of Kin",
      icon: Users,
      editable: true,
      fields: [
        { label: "Full Name", value: profile.next_of_kin_name || "Not set" },
        { label: "Phone", value: profile.next_of_kin_phone || "Not set" },
        { label: "Relationship", value: profile.next_of_kin_relationship || "Not set" },
      ],
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {infoSections.map((section, index) => {
        const Icon = section.icon;
        return (
          <div
            key={index}
            className={`rounded-xl border ${levelBorder} p-6 shadow-xl backdrop-blur ${
              section.editable ? "bg-slate-900/50" : "bg-slate-900/30"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg p-2 ${section.editable ? `${levelBg} bg-opacity-10` : "bg-slate-700/30"}`}>
                  <Icon className={`h-4 w-4 ${section.editable ? levelColor : "text-slate-400"}`} />
                </div>
                <h3 className="font-semibold text-white">{section.title}</h3>
              </div>
              {!section.editable && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Lock className="h-3 w-3" />
                  Read-only
                </span>
              )}
              {section.editable && (
                <span className={`flex items-center gap-1 text-xs ${levelColor}`}>
                  Editable
                </span>
              )}
            </div>
            <div className="space-y-3">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  <p className="text-xs text-slate-400">{field.label}</p>
                  <p className="text-sm font-medium text-white">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}