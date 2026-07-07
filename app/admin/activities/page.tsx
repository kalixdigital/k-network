import { Metadata } from "next";
import ActivityLogs from "@/components/admin/activities/ActivityLogs";

export const metadata: Metadata = {
  title: "Activity Logs | Admin | K-NETWORK",
  description: "View system and user activity logs",
};

export default function ActivitiesPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Activity Logs</h1>
        <p className="mt-1 text-slate-400">View system and user activity logs</p>
      </div>

      <div className="w-full overflow-hidden">
        <ActivityLogs />
      </div>
    </div>
  );
}