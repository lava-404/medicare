import { ItemStatus } from "@/types";
import { CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: ItemStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    OK: {
      className: "bg-green-100 text-green-700",
      Icon: CheckCircle,
    },
    "Low Stock": {
      className: "bg-amber-100 text-amber-700",
      Icon: AlertTriangle,
    },
    "Near Expiry": {
      className: "bg-orange-100 text-orange-700",
      Icon: Clock,
    },
    Expired: {
      className: "bg-red-100 text-red-700",
      Icon: XCircle,
    },
  };

  const { className, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
