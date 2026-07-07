"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

type Member = {
  id: string;
  full_name: string;
  email: string;
  id_number: string;
  phone: string;
  country: string;
  state: string;
  membership_level: number;
  monthly_points: number;
  lifetime_points: number;
  monthly_earnings: number;
  lifetime_earnings: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_verified: boolean;
  role: string;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
};

type Activity = {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
};

type Props = {
  id: string;
};

export default function MemberDetails({ id }: Props) {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasActivitiesTable, setHasActivitiesTable] = useState(true);

  useEffect(() => {
    loadMemberDetails();
  }, [id]);

  const loadMemberDetails = async () => {
    setLoading(true);
    try {
      // Load member
      const { data: memberData, error: memberError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (memberError) {
        console.error("Member fetch error:", memberError);
        showToast.error("Failed to load member details");
        setLoading(false);
        return;
      }

      if (!memberData) {
        showToast.error("Member not found");
        router.push("/admin/members");
        setLoading(false);
        return;
      }

      setMember(memberData);

      // Try to load activities - handle if table doesn't exist
      try {
        const { data: activityData, error: activityError } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (activityError) {
          // If table doesn't exist, just set empty activities
          if (activityError.message?.includes('does not exist')) {
            setHasActivitiesTable(false);
            setActivities([]);
          } else {
            console.warn("Activity fetch error:", activityError);
            setActivities([]);
          }
        } else {
          setActivities(activityData || []);
          setHasActivitiesTable(true);
        }
      } catch (activityErr) {
        console.warn("Activity table may not exist:", activityErr);
        setHasActivitiesTable(false);
        setActivities([]);
      }
    } catch (error) {
      console.error("Error loading member details:", error);
      showToast.error("Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberStatus = async () => {
    if (!member) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_verified: !member.is_verified,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      showToast.success(`Member ${member.is_verified ? 'unverified' : 'verified'} successfully`);
      loadMemberDetails();
    } catch (error) {
      console.error("Error toggling status:", error);
      showToast.error("Failed to update member status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading member details...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Member not found</p>
        <button
          onClick={() => router.push("/admin/members")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/members")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </button>

      {/* Member Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl font-bold text-emerald-400">
            {member.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {member.full_name || "N/A"}
            </h1>
            <p className="text-sm text-slate-400">{member.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusBadge status={member.is_verified ? "active" : "inactive"} type="member" />
              <StatusBadge status={member.role || "user"} type="member" />
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-400">
                <Award className="h-3 w-3" />
                Level {member.membership_level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={toggleMemberStatus}
            disabled={updating}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition disabled:opacity-50 ${
              member.is_verified
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {member.is_verified ? (
              <>
                <XCircle className="h-4 w-4" />
                Unverify
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Verify
              </>
            )}
          </button>

          <button
            onClick={loadMemberDetails}
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Member Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Member Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Full Name</p>
                <p className="text-white">{member.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Member ID</p>
                <p className="font-mono text-white">{member.id_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {member.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="text-white flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {member.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Location</p>
                <p className="text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {member.country || "N/A"}
                  {member.state && `, ${member.state}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Joined</p>
                <p className="text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Referred By</p>
                <p className="text-white">{member.referred_by || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Statistics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Monthly Points</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {member.monthly_points}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Lifetime Points</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {member.lifetime_points}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Monthly Earnings</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ₦{member.monthly_earnings?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Lifetime Earnings</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ₦{member.lifetime_earnings?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Direct Referrals</p>
                <p className="text-2xl font-bold text-white">
                  {member.direct_referrals || 0}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Indirect Referrals</p>
                <p className="text-2xl font-bold text-white">
                  {member.indirect_referrals || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <div className="mt-4 space-y-3">
              {!hasActivitiesTable ? (
                <div className="text-center py-4">
                  <p className="text-slate-400">Activity log coming soon</p>
                  <p className="text-xs text-slate-500">Activities will appear here once available</p>
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No activity yet</p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg bg-slate-800/50 p-3"
                  >
                    <p className="text-sm font-medium text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}