import Card from "./Card";
import EmptyChart from "./EmptyChart";
import { ROUTE_ORDER, routeColor, routeLabel, type Route } from "@/lib/colors";
import { formatDuration } from "@/lib/format";

export default function FinalityTime({ finalityByRoute }: { finalityByRoute: Record<Route, number | null> }) {
  const entries = ROUTE_ORDER.map((route) => ({ route, seconds: finalityByRoute[route] })).filter(
    (e) => e.seconds != null,
  ) as { route: Route; seconds: number }[];

  const max = entries.length > 0 ? Math.max(...entries.map((e) => e.seconds)) : 0;

  return (
    <Card title="Median Finality Time" subtitle="Hemi → ETH includes the 1-day OP Stack challenge window">
      {entries.length === 0 ? (
        <EmptyChart message="No finalized transfers yet" height={100} />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(({ route, seconds }) => (
            <div key={route} className="flex items-center gap-3">
              <span className="w-20 shrink-0 font-mono text-[11px]" style={{ color: routeColor(route) }}>
                {routeLabel(route)}
              </span>
              <div className="h-2 flex-1 bg-[var(--border2)]">
                <div
                  className="h-full"
                  style={{ width: `${max > 0 ? (seconds / max) * 100 : 0}%`, background: routeColor(route) }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-[11px] text-[var(--muted)]">
                {formatDuration(seconds)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
