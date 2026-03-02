import { cn } from "../../../lib/utils";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  pending_reception: { label: "Pending Reception", color: "bg-amber-100 text-amber-800", dot: "bg-amber-400" },
  pending_doctor: { label: "Pending Doctor", color: "bg-sky-100 text-sky-800", dot: "bg-sky-400" },
  rejected_reception: { label: "Rejected by Reception", color: "bg-rose-100 text-rose-800", dot: "bg-rose-400" },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800", dot: "bg-green-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", dot: "bg-red-400" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-800", dot: "bg-blue-400" },
  active: { label: "Active", color: "bg-green-100 text-green-800", dot: "bg-green-400" },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-800", dot: "bg-gray-400" },
  verified: { label: "Verified", color: "bg-green-100 text-green-800", dot: "bg-green-400" },
  unverified: { label: "Unverified", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  free: { label: "Free", color: "bg-slate-100 text-slate-800", dot: "bg-slate-400" },
  pro: { label: "Pro", color: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-400" },
};

const StatusBadge = ({ status, showDot = true }) => {
  const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800", dot: "bg-gray-400" };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.color)}>
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
