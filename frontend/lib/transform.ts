/** Pure data-shaping for Recharts — turns the parallel bucket/route arrays the
 * summary API returns into the `[{ date, ROUTE: value, ... }]` shape Recharts
 * wants. No fs/network access, safe to import in client components. */
import type { AnalyticsSummary } from "./analytics";
import { INFLOW_ROUTES, OUTFLOW_ROUTES, ROUTE_ORDER, type Route } from "./colors";
import { formatBucketLabel } from "./format";

export interface ChartDataPoint {
  date: string;
  [route: string]: string | number;
}

export function transformSeriesToChart(
  summary: Pick<AnalyticsSummary, "bucketStarts" | "countByRoute" | "usdVolumeByRoute">,
  granularity: "DAY" | "WEEK" | "MONTH",
  metric: "volume" | "count",
): ChartDataPoint[] {
  const source = metric === "volume" ? summary.usdVolumeByRoute : summary.countByRoute;
  return summary.bucketStarts.map((bucketStart, i) => {
    const point: ChartDataPoint = { date: formatBucketLabel(bucketStart, granularity) };
    for (const route of ROUTE_ORDER) {
      point[route] = source[route][i] ?? 0;
    }
    return point;
  });
}

export interface NetFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}

export function transformToNetFlow(
  summary: Pick<AnalyticsSummary, "bucketStarts" | "usdVolumeByRoute">,
  granularity: "DAY" | "WEEK" | "MONTH",
): NetFlowPoint[] {
  return summary.bucketStarts.map((bucketStart, i) => {
    const inflow = INFLOW_ROUTES.reduce((sum, route) => sum + (summary.usdVolumeByRoute[route][i] ?? 0), 0);
    const outflowMagnitude = OUTFLOW_ROUTES.reduce(
      (sum, route) => sum + (summary.usdVolumeByRoute[route as Route][i] ?? 0),
      0,
    );
    return {
      date: formatBucketLabel(bucketStart, granularity),
      inflow,
      outflow: -outflowMagnitude,
      net: inflow - outflowMagnitude,
    };
  });
}

/**
 * Approximates a "vs prior period" delta by comparing the second half of the
 * currently-loaded window's buckets against the first half — there's no
 * arbitrary-range query on strait-api to fetch a true preceding window, so
 * this reads as "trending up/down within this window" rather than an exact
 * period-over-period comparison.
 */
export function computeDelta(series: (number | null)[]): number | null {
  const values = series.map((v) => v ?? 0);
  if (values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const before = avg(firstHalf);
  const after = avg(secondHalf);
  if (before === 0) return after === 0 ? null : 100;
  return ((after - before) / before) * 100;
}
