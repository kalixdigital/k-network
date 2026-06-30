type Props = {
  status: string;
};

export default function OrderStatusBadge({
  status,
}: Props) {
  const styles = {
    Pending: "bg-yellow-500/20 text-yellow-400",
    Approved: "bg-green-500/20 text-green-400",
    Rejected: "bg-red-500/20 text-red-400",
    Cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status as keyof typeof styles] ||
        "bg-slate-700 text-white"
      }`}
    >
      {status}
    </span>
  );
}
