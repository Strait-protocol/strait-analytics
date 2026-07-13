export default function StatTile({
  label,
  value,
  sub,
  delta,
  accentColor,
  bordered = true,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number | null;
  accentColor?: string;
  bordered?: boolean;
}) {
  const deltaLabel = delta != null ? `${delta >= 0 ? "▲ +" : "▼ "}${delta.toFixed(1)}%` : null;

  return (
    <div
      className={`flex-1 min-w-[160px] bg-[var(--surface)] px-[22px] py-5 ${bordered ? "border-r border-[var(--border)]" : ""}`}
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : undefined}
    >
      <div className="font-mono text-[10px] tracking-[1px] text-[var(--muted)] uppercase mb-2.5">{label}</div>
      <div className="font-mono text-[30px] font-bold leading-none text-[var(--text)]">{value}</div>
      <div className="flex justify-between mt-1.5">
        <span className="font-mono text-[10px] text-[var(--muted)]">{sub}</span>
        {deltaLabel && (
          <span
            className="font-mono text-[10px]"
            style={{ color: delta! >= 0 ? "var(--green)" : "var(--red)" }}
          >
            {deltaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
