interface StatusBadgeProps {
  status: "Pending" | "Approved" | "Rejected";
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const colors = {
    Pending: "bg-yellow-500",
    Approved: "bg-emerald-500",
    Rejected: "bg-red-500",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium text-white ${colors[status]}`}
    >
      {status}
    </span>
  );
}
