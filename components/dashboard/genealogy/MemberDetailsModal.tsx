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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${levelBg} bg-opacity-20 text-3xl font-bold ${levelColor}`}>
            {member.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
            <p className="text-sm text-slate-400">{member.id_number}</p>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid gap-4 md:grid-cols-2">
          {infoSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className={`rounded-xl border ${levelData.borderColor} bg-slate-900/50 p-4`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`rounded-lg ${levelData.badgeBg} p-1.5`}>
                    <Icon className={`h-4 w-4 ${levelData.badgeText}`} />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                </div>
                <div className="space-y-2">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex}>
                      <p className="text-xs text-slate-400">{field.label}</p>
                      <p className="text-sm font-medium text-white">
                        {typeof field.value === 'string' ? field.value : field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}