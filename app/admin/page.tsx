import {
  Users,
  FileText,
  ShieldAlert,
  DollarSign,
} from "lucide-react";

import { StatsCard } from "@/components/admin/stats-card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 p-6">

      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Welcome back, Admin 👋
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <StatsCard
          title="Users"
          value="0"
          description="Registered users"
          icon={<Users className="h-5 w-5" />}
        />

        <StatsCard
          title="Posts"
          value="0"
          description="Published posts"
          icon={<FileText className="h-5 w-5" />}
        />

        <StatsCard
          title="Reports"
          value="0"
          description="Pending reports"
          icon={<ShieldAlert className="h-5 w-5" />}
        />

        <StatsCard
          title="Revenue"
          value="₦0"
          description="Total earnings"
          icon={<DollarSign className="h-5 w-5" />}
        />

      </div>

    </div>
  );
}