"use client";

import { User, Mail, Phone, MapPin, Award, Crown, CheckCircle, Clock } from "lucide-react";
import { getLevel, getLevelName } from "@/lib/constants/levels";

type ProfileHeaderProps = {
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  membership_level: number;
  is_verified: boolean;
  is_active: boolean;
  registration_completed: boolean;
  avatar_url?: string;
  onEdit: () => void;
};

export default function ProfileHeader({
  full_name,
  email,
  phone,
  id_number,
  membership_level,
  is_verified,
  is_active,
  registration_completed,
  onEdit,
}: ProfileHeaderProps) {
  const levelData = getLevel(membership_level);
  const levelName = getLevelName(membership_level);
  const status = is_active && is_verified ? "Active" : "Pending";
  const statusColor = is_active && is_verified ? "text-emerald-400 border-emerald-500/50" : "text-yellow-400 border-yellow-500/50";

  // Level icons mapping for display
  const levelIcons: Record<number, string> = {
    1: "🌟",
    2: "🥉",
    3: "🥈",
    4: "🥇",
    5: "💎",
    6: "👑",
  };
  const levelIcon = levelIcons[membership_level] || "🌟";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/50 p-6 shadow-xl backdrop-blur">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${levelData.bgColor} text-3xl font-bold text-white md:h-24 md:w-24 md:text-4xl`}>
              {full_name?.charAt(0) || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-slate-800 p-1">
              <div className={`h-3 w-3 rounded-full ${is_active && is_verified ? "bg-emerald-400" : "bg-yellow-400"}`} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">{full_name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {phone || "Not set"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onEdit}
                className={`flex items-center gap-2 rounded-lg border ${levelData.borderColor} px-4 py-2 text-sm font-medium text-white transition hover:${levelData.hoverBg}`}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}>
              {is_active && is_verified ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {status}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border ${levelData.borderColor} ${levelData.lightBg} px-3 py-1 text-xs font-medium ${levelData.textColor}`}>
              <span>{levelIcon}</span>
              {levelName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-950/20 px-3 py-1 text-xs font-medium text-purple-400">
              <User className="h-3 w-3" />
              {id_number}
            </span>
            {registration_completed ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                Profile Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-950/20 px-3 py-1 text-xs font-medium text-yellow-400">
                <Clock className="h-3 w-3" />
                Profile Incomplete
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}