"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CheckReferralPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, id_number, referred_by, email, created_at")
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error loading profiles:", error);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    }

    loadProfiles();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">🔍 Check Referrals</h1>
      
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white text-lg">{profile.full_name}</p>
                <p className="text-sm text-slate-400">Email: {profile.email}</p>
                <p className="text-sm text-slate-400">
                  ID Number: <span className="text-emerald-400 font-mono">{profile.id_number}</span>
                </p>
                <p className="text-sm text-slate-400">
                  Referred By: <span className="text-yellow-400">{profile.referred_by || '❌ NULL'}</span>
                </p>
                <p className="text-xs text-slate-500">User ID: {profile.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}