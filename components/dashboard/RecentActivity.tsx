"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Activity = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

export default function RecentActivity() {

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {

    const loadActivities = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setActivities(data || []);

    };

    loadActivities();

  }, []);

  return (

    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-bold text-white">
        Recent Activity
      </h2>

      <div className="mt-6 space-y-4">

        {activities.length === 0 && (

          <p className="text-slate-400">
            No activity yet.
          </p>

        )}

        {activities.map((activity) => (

          <div
            key={activity.id}
            className="rounded-xl bg-slate-800 p-4"
          >

            <h3 className="font-semibold text-white">
              {activity.title}
            </h3>

            <p className="text-sm text-slate-400">
              {activity.description}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {new Date(activity.created_at).toLocaleString()}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}
