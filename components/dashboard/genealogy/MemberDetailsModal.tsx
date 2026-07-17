"use client";

import { X, User, Mail, Phone, MapPin, Award, Coins, Users, Calendar, CheckCircle, Clock, Crown } from "lucide-react";
import { getLevel, getLevelName } from "@/lib/constants/levels";

type MemberDetails = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  membership_level: number;
  points: number;
  total_earnings: number;
  monthly_points: number;
  lifetime_points: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_active: boolean;
  is_verified: boolean;
  registration_completed: boolean;
  created_at: string;
  first_purchase_date: string | null;
  activation_date: string | null;
};

type MemberDetailsModalProps = {
  member: MemberDetails | null;
  isOpen: boolean;
  onClose: () => void;
};

// Level icons mapping
const levelIcons: Record<number, string> = {
  1: "🌟",
  2: "🥉",
  3: "🥈",
  4: "🥇",
  5: "💎",
  6: "👑",
};

export default function MemberDetailsModal({ member, isOpen, onClose }: MemberDetailsModalProps) {
  if (!isOpen || !member) return null;

  const levelData = getLevel(member.membership_level);
  const levelIcon = levelIcons[member.membership_level] || "🌟";
  const levelName = getLevelName(member.membership_level);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  
  const status = member.is_active && member.is_verified ? "Active" : "Pending";
  const statusColor = member.is_active && member.is_verified ? "text-emerald-400" : "text-yellow-400";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const infoSections = [
    {
      title: "Personal Information",
      icon: User,
      fields: [
        { label: "Full Name", value: member.full_name },
        { label: "Email", value: member.email },
        { label: "Phone", value: member.phone || "Not set" },
        { label: "Member ID", value: member.id_number },
      ],
    },
    {
      title: "Membership",
      icon: Award,
      fields: [
        { 
          label: "Level", 
          value: (
            <span className={`flex items-center gap-1 ${levelColor}`}>
              {levelIcon} {levelName}
            </span>
          ) 
        },
        { label: "Status", value: (
          <span className={`flex items-center gap-1 ${statusColor}`}>
            {member.is_active && member.is_verified ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {status}
          </span>
        )},
        { label: "Profile Complete", value: member.registration_completed ? "✅ Yes" : "❌ No" },
        { label: "Joined", value: formatDate(member.created_at) },
      ],
    },
    {
      title: "Points & Earnings",
      icon: Coins,
      fields: [
        { label: "Total Points", value: member.points.toLocaleString() },
        { label: "Monthly Points", value: member.monthly_points.toLocaleString() },
        { label: "Lifetime Points", value: member.lifetime_points.toLocaleString() },
        { label: "Total Earnings", value: `₦${member.total_earnings.toLocaleString()}` },
      ],
    },
    {
      title: "Referrals",
      icon: Users,
      fields: [
        { label: "Direct Referrals", value: member.direct_referrals },
        { label: "Indirect Referrals", value: member.indirect_referrals },
        { label: "First Purchase", value: member.first_purchase_date ? formatDate(member.first_purchase_date) : "❌ Not yet" },
        { label: "Activation Date", value: member.activation_date ? formatDate(member.activation_date) : "Not activated" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="
          relative
          w-full
          max-w-md
          sm:max-w-xl
          lg:max-w-2xl
          max-h-[80vh]
          overflow-y-auto
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          shadow-2xl
          p-4
          sm:p-6
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header - Clean and centered */}
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full ${levelBg} bg-opacity-20 text-2xl sm:text-3xl font-bold ${levelColor} flex-shrink-0`}
          >
            {member.full_name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg sm:text-xl font-bold text-white">
              {member.full_name}
            </h2>
            <p className="truncate text-xs sm:text-sm text-slate-400">
              {member.id_number}
            </p>
          </div>
        </div>

        {/* Info Sections - Clean grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {infoSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className={`rounded-xl border ${levelData.borderColor} bg-slate-900/50 p-3 sm:p-4`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`rounded-lg ${levelData.badgeBg} p-1.5`}>
                    <Icon className={`h-4 w-4 ${levelData.badgeText}`} />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                </div>
                <div className="space-y-3">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-0.5">
                      <p className="text-[11px] text-slate-400">
                        {field.label}
                      </p>
                      <div className="break-words text-sm font-medium text-white">
                        {typeof field.value === 'string' ? field.value : field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer - Centered close button */}
        <div className="mt-5 flex justify-center border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}