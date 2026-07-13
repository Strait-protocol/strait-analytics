export default function EmptyChart({ message = "No data for this period", height = 200 }: { message?: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 font-mono text-xs text-[var(--muted)]"
      style={{ height }}
    >
      <span className="text-xl opacity-40">∅</span>
      {message}
    </div>
  );
}
