import { 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Package,
  ShoppingBag,
  Truck,
  Receipt,
  CalendarCheck
} from "lucide-react";

type Props = {
  status: string;
  className?: string;
};

export default function OrderStatusBadge({ status, className = "" }: Props) {
  const getStatusStyles = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      pending: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Pending",
      },
      processing: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        icon: <RefreshCw className="h-3.5 w-3.5" />,
        label: "Processing",
      },
      shipped: {
        bg: "bg-indigo-500/20",
        text: "text-indigo-400",
        icon: <Truck className="h-3.5 w-3.5" />,
        label: "Shipped",
      },
      delivered: {
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        icon: <Package className="h-3.5 w-3.5" />,
        label: "Delivered",
      },
      completed: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: "Cancelled",
      },
      rejected: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        label: "Rejected",
      },
    };

    const normalizedStatus = status.toLowerCase();
    return statusMap[normalizedStatus] || {
      bg: "bg-slate-700",
      text: "text-white",
      icon: <ShoppingBag className="h-3.5 w-3.5" />,
      label: status,
    };
  };

  const styles = getStatusStyles(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${styles.bg} ${styles.text} ${className}`}
    >
      {styles.icon}
      {styles.label}
    </span>
  );
}