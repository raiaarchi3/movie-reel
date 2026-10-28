const PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z";

export function StarIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`shrink-0 fill-current ${className}`}>
      <path d={PATH} />
    </svg>
  );
}

// Read-only star bar that supports fractional averages (e.g. 3.6).
export default function Stars({ value = 0, size = "h-3.5 w-3.5" }) {
  const pct = Math.max(0, Math.min(5, value)) / 5 * 100;
  const row = (
    <span className="flex">
      {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className={size} />)}
    </span>
  );
  return (
    <span
      role="img"
      aria-label={value ? `${value.toFixed(1)} out of 5` : "No ratings yet"}
      className="relative inline-block shrink-0 align-middle"
    >
      <span className="block text-star-off">{row}</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden text-star" style={{ width: `${pct}%` }}>
        {row}
      </span>
    </span>
  );
}
