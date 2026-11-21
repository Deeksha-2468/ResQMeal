const STATUS_MAP = {
  posted: { label: "Posted", className: "badge-posted" },
  claimed: { label: "Claimed", className: "badge-claimed" },
  collected: { label: "Collected", className: "badge-collected" },
  delivered: { label: "Delivered", className: "badge-delivered" },
  expired: { label: "Expired", className: "badge-expired" },
};

export default function StatusBadge({ status }) {
  const entry = STATUS_MAP[status] ?? { label: status, className: "" };
  return <span className={`badge ${entry.className}`.trim()}>{entry.label}</span>;
}
