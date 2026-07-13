export default function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="relative overflow-hidden bg-[var(--surface2)]" style={{ height }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, var(--border2) 50%, transparent)",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </div>
  );
}
