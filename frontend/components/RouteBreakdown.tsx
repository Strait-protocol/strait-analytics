import Card from "./Card";
import EmptyChart from "./EmptyChart";
import { routeColor, routeLabel } from "@/lib/colors";
import { formatCount, formatPercent } from "@/lib/format";

export default function RouteBreakdown({
  breakdown,
}: {
  breakdown: { route: string; transferCount: number; share: number }[];
}) {
  if (breakdown.length === 0) {
    return (
      <Card title="Route Breakdown">
        <EmptyChart message="No transfers in this window yet" height={140} />
      </Card>
    );
  }

  const sorted = [...breakdown].sort((a, b) => b.transferCount - a.transferCount);

  return (
    <Card title="Route Breakdown">
      {sorted.map((r) => (
        <div key={r.route} className="mb-4 last:mb-0">
          <div className="flex justify-between mb-1.5">
            <span className="font-mono text-[11px]" style={{ color: routeColor(r.route) }}>
              {routeLabel(r.route)}
            </span>
            <span className="font-mono text-[10px] text-[var(--muted)]">
              {formatCount(r.transferCount)} · {formatPercent(r.share)}
            </span>
          </div>
          <div className="h-[2px] bg-[var(--border2)]">
            <div
              className="h-full transition-[width] duration-500 ease-out"
              style={{ width: `${r.share * 100}%`, background: routeColor(r.route) }}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}
