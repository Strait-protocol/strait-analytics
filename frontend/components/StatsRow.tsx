import StatTile from "./StatTile";
import type { AnalyticsSummary, TimeWindow } from "@/lib/analytics";
import type { Route } from "@/lib/colors";
import { formatCount, formatDuration, formatUsd } from "@/lib/format";
import { computeDelta } from "@/lib/transform";

const WINDOW_LABEL: Record<TimeWindow, string> = {
  LAST_24H: "last 24 hours",
  LAST_7D: "last 7 days",
  LAST_30D: "last 30 days",
  ALL_TIME: "all time",
};

export default function StatsRow({
  summary,
  finalityByRoute,
  window,
}: {
  summary: AnalyticsSummary;
  finalityByRoute: Record<Route, number | null> | undefined;
  window: TimeWindow;
}) {
  const inFlight = summary.stats.initiated + summary.stats.anchored + summary.stats.proving;

  const finalityValues = finalityByRoute ? Object.values(finalityByRoute).filter((v): v is number => v != null) : [];
  const avgFinality = finalityValues.length > 0 ? finalityValues.reduce((s, v) => s + v, 0) / finalityValues.length : null;

  const volumeDelta = computeDelta(summary.usdVolume);
  // Total transfer count per bucket, summed across routes — used for the transfers delta.
  const countSeries = summary.bucketStarts.map((_, i) =>
    Object.keys(summary.countByRoute).reduce((sum, route) => sum + summary.countByRoute[route as Route][i], 0),
  );
  const transfersDelta = computeDelta(countSeries);

  return (
    <div className="flex border border-[var(--border)] flex-wrap">
      <StatTile
        label="Total Volume"
        value={formatUsd(summary.totalUsdVolume)}
        sub={WINDOW_LABEL[window]}
        delta={volumeDelta}
        accentColor="var(--accent)"
      />
      <StatTile
        label="Transfers"
        value={formatCount(summary.totalTransfers)}
        sub={WINDOW_LABEL[window]}
        delta={transfersDelta}
      />
      <StatTile
        label="Finalized"
        value={formatCount(summary.stats.finalized)}
        sub={WINDOW_LABEL[window]}
        accentColor="var(--green)"
      />
      <StatTile
        label="Avg Finality"
        value={formatDuration(avgFinality)}
        sub="source → dest"
        accentColor="var(--hemi)"
      />
      <StatTile
        label="In Flight"
        value={formatCount(inFlight)}
        sub="pending"
        accentColor="var(--amber)"
        bordered={false}
      />
    </div>
  );
}
