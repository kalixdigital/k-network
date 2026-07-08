"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DebugPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, id_number, email, referred_by")
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
      <h1 className="text-3xl font-bold text-white mb-6">🔍 Debug - Available Referral Codes</h1>
      
      <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg mb-6">
        <p className="text-yellow-300 font-semibold">How to test:</p>
        <p className="text-yellow-200 text-sm mt-1">
          1. Copy any <strong>ID Number</strong> from below<br/>
          2. Go to <strong>/register?ref=PASTE_ID_HERE</strong><br/>
          3. The referral field should auto-fill and validate
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
          <p className="text-red-300">No profiles found! Create a test user first.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 hover:border-emerald-500 transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white text-lg">{profile.full_name}</p>
                  <p className="text-sm text-slate-400">Email: {profile.email}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    ID Number: <span className="text-emerald-400 font-mono font-bold">{profile.id_number}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Referred By: {profile.referred_by || 'None'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profile.id_number);
                    alert(`✅ Copied: ${profile.id_number}`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  📋 Copy ID
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-slate-800 p-4 rounded-lg">
        <h2 className="text-white font-semibold mb-2">💡 Test Links:</h2>
        {profiles.map((profile) => (
          <div key={profile.id} className="text-sm text-slate-300 mt-1">
            <span className="text-emerald-400">→</span> /register?ref={profile.id_number}
          </div>
        ))}
      </div>
    </div>
  );
}