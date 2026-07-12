"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getLevel } from "@/lib/constants/levels";
import { ArrowLeft, Bell, BellRing, Mail, ShoppingBag, Users, Gift, Crown } from "lucide-react";
import { showToast } from "@/components/ui/toast";

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();
  const userLevel = 1;
  const levelData = getLevel(userLevel);
  const levelColor = levelData.textColor;
  const levelBg = levelData.bgColor;
  const levelBorder = levelData.borderColor;

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "push",
      label: "Push Notifications",
      description: "Receive push notifications on your device",
      icon: Bell,
      enabled: true,
    },
    {
      id: "email",
      label: "Email Notifications",
      description: "Receive notifications via email",
      icon: Mail,
      enabled: true,
    },
    {
      id: "purchase",
      label: "Purchase Updates",
      description: "Get notified about your orders and purchases",
      icon: ShoppingBag,
      enabled: true,
    },
    {
      id: "referral",
      label: "Referral Activity",
      description: "Get notified when someone joins using your referral",
      icon: Users,
      enabled: true,
    },
    {
      id: "rewards",
      label: "Rewards & Bonuses",
      description: "Get notified about rewards and bonuses",
      icon: Gift,
      enabled: true,
    },
    {
      id: "membership",
      label: "Membership Updates",
      description: "Get notified about membership level changes",
      icon: Crown,
      enabled: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    showToast.success("Notification preference updated");
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-slate-400">Manage your notification preferences</p>
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
        <div className="space-y-4">
          {settings.map((setting) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 p-4 transition hover:bg-slate-800/30"
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg ${levelData.badgeBg} p-2 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${levelData.badgeText}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{setting.label}</p>
                    <p className="text-xs text-slate-400">{setting.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setting.id)}
                  className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
                    setting.enabled ? levelBg : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                      setting.enabled ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className={`rounded-2xl border ${levelBorder} bg-slate-900/50 p-6 shadow-xl backdrop-blur`}>
        <div className="flex items-center gap-3">
          <BellRing className={`h-5 w-5 ${levelColor}`} />
          <div>
            <p className="text-sm text-white">Stay Updated</p>
            <p className="text-xs text-slate-400">
              Enable notifications to stay informed about important updates and activities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}