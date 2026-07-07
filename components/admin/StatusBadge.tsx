"use client";

type StatusBadgeProps = {
  status: string;
  type?: "order" | "payment" | "member";
};

export default function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      // Order statuses
      pending: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        label: "Pending",
      },
      processing: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        label: "Processing",
      },
      completed: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "Cancelled",
      },
      // Payment statuses
      paid: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "Paid",
      },
      failed: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "Failed",
      },
      // Member statuses
      active: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "Active",
      },
      inactive: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "Inactive",
      },
      // Withdrawal statuses
      approved: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "Approved",
      },
      rejected: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "Rejected",
      },
    };

    const normalizedStatus = status.toLowerCase();
    return statusMap[normalizedStatus] || {
      bg: "bg-slate-700",
      text: "text-white",
      label: status,
    };
  };

  const styles = getStatusStyles();

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles.bg} ${styles.text}`}>
      {styles.label}
    </span>
  );
}