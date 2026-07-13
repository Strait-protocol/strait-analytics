/**
 * Server-only: fetches analyticsSeries/routeBreakdown/stats from strait-api and
 * shapes them, with CoinGecko USD conversion, into the payload the dashboard
 * renders. Runs behind app/api/analytics/summary/route.ts so client components
 * can poll it with React Query (the price cache in lib/prices.ts touches the
 * filesystem, so this can't run in the browser).
 */
import { forwardGraphQL, type Network } from "./graphql";
import { ANALYTICS_SERIES_QUERY, ROUTE_BREAKDOWN_QUERY, STATS_QUERY } from "./queries";
import { getCurrentPrice, getHistoricalPrices, atomicToUsd } from "./prices";
import { ROUTE_ORDER, type Route } from "./colors";

export type TimeWindow = "LAST_24H" | "LAST_7D" | "LAST_30D" | "ALL_TIME";
export type Granularity = "DAY" | "WEEK" | "MONTH";

interface AnalyticsBucket {
  bucketStart: string;
  route: string;
  asset: string;
  transferCount: number;
  volume: string;
}

interface RouteBreakdownEntry {
  route: string;
  transferCount: number;
  share: number;
}

export interface Stats {
  totalTransfers: number;
  initiated: number;
  anchored: number;
  proving: number;
  finalized: number;
  failed: number;
  reorged: number;
  popAnchored: number;
}

export interface AssetTotal {
  asset: string;
  transferCount: number;
  usdVolume: number | null;
}

export interface AnalyticsSummary {
  bucketStarts: string[];
  countByRoute: Record<Route, number[]>;
  usdVolumeByRoute: Record<Route, (number | null)[]>;
  usdVolume: (number | null)[];
  routeBreakdown: RouteBreakdownEntry[];
  routeCountTotals: Record<Route, number>;
  routeVolumeTotals: Record<Route, number | null>;
  assetTotalsByRoute: Record<Route, AssetTotal[]>;
  totalTransfers: number;
  totalUsdVolume: number | null;
  mostUsedRoute: string | null;
  stats: Stats;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function buildAnalyticsSummary(
  network: Network,
  window: TimeWindow,
  granularity: Granularity,
): Promise<AnalyticsSummary> {
  const [seriesData, breakdownData, statsData] = await Promise.all([
    forwardGraphQL(network, ANALYTICS_SERIES_QUERY, { window, granularity }) as Promise<{
      analyticsSeries: AnalyticsBucket[];
    }>,
    forwardGraphQL(network, ROUTE_BREAKDOWN_QUERY, { window }) as Promise<{
      routeBreakdown: RouteBreakdownEntry[];
    }>,
    forwardGraphQL(network, STATS_QUERY, { window }) as Promise<{ stats: Stats }>,
  ]);

  const buckets = seriesData.analyticsSeries;
  const breakdown = breakdownData.routeBreakdown;
  const stats = statsData.stats;

  const bucketStarts = Array.from(new Set(buckets.map((b) => b.bucketStart))).sort();

  const today = dayKey(new Date().toISOString());
  const assetsPresent = Array.from(new Set(buckets.map((b) => b.asset).filter((a) => a === "BTC" || a === "ETH")));

  let priceByAssetDay: Record<string, Record<string, number>> = {};
  if (bucketStarts.length > 0 && assetsPresent.length > 0) {
    const from = new Date(bucketStarts[0]);
    const to = new Date();
    const [historical, currentPrices] = await Promise.all([
      Promise.all(assetsPresent.map(async (asset) => [asset, await getHistoricalPrices(asset, from, to)] as const)),
      Promise.all(assetsPresent.map(async (asset) => [asset, await getCurrentPrice(asset)] as const)),
    ]);
    priceByAssetDay = Object.fromEntries(historical);
    for (const [asset, price] of currentPrices) {
      if (price != null) {
        priceByAssetDay[asset] = { ...priceByAssetDay[asset], [today]: price };
      }
    }
  }

  const priceFor = (asset: string, bucketStart: string): number | null =>
    priceByAssetDay[asset]?.[dayKey(bucketStart)] ?? null;

  const countByRoute = Object.fromEntries(
    ROUTE_ORDER.map((route) => [route, bucketStarts.map(() => 0)]),
  ) as Record<Route, number[]>;
  const usdVolumeByRoute = Object.fromEntries(
    ROUTE_ORDER.map((route) => [route, bucketStarts.map<number | null>(() => null)]),
  ) as Record<Route, (number | null)[]>;
  const usdVolumeByRouteKnown = Object.fromEntries(
    ROUTE_ORDER.map((route) => [route, bucketStarts.map(() => false)]),
  ) as Record<Route, boolean[]>;

  const usdVolume: (number | null)[] = bucketStarts.map(() => null);
  const usdVolumeKnown: boolean[] = bucketStarts.map(() => false);

  const assetAccum = new Map<Route, Map<string, { count: number; usd: number | null }>>();
  for (const route of ROUTE_ORDER) assetAccum.set(route, new Map());

  for (const bucket of buckets) {
    const idx = bucketStarts.indexOf(bucket.bucketStart);
    if (idx === -1) continue;
    const route = bucket.route as Route;
    const isKnownRoute = ROUTE_ORDER.includes(route);
    if (isKnownRoute) {
      countByRoute[route][idx] += bucket.transferCount;
    }

    const usd = atomicToUsd(bucket.asset, bucket.volume, priceFor(bucket.asset, bucket.bucketStart));
    if (usd != null) {
      usdVolume[idx] = (usdVolume[idx] ?? 0) + usd;
      usdVolumeKnown[idx] = true;
      if (isKnownRoute) {
        usdVolumeByRoute[route][idx] = (usdVolumeByRoute[route][idx] ?? 0) + usd;
        usdVolumeByRouteKnown[route][idx] = true;
      }
    }

    if (isKnownRoute) {
      const assets = assetAccum.get(route)!;
      const entry = assets.get(bucket.asset) ?? { count: 0, usd: null };
      entry.count += bucket.transferCount;
      if (usd != null) entry.usd = (entry.usd ?? 0) + usd;
      assets.set(bucket.asset, entry);
    }
  }

  for (let i = 0; i < usdVolume.length; i++) {
    if (!usdVolumeKnown[i]) usdVolume[i] = null;
    for (const route of ROUTE_ORDER) {
      if (!usdVolumeByRouteKnown[route][i]) usdVolumeByRoute[route][i] = null;
    }
  }

  const routeCountTotals = Object.fromEntries(
    ROUTE_ORDER.map((route) => [route, countByRoute[route].reduce((s, v) => s + v, 0)]),
  ) as Record<Route, number>;

  const routeVolumeTotals = Object.fromEntries(
    ROUTE_ORDER.map((route) => {
      const known = usdVolumeByRouteKnown[route].some(Boolean);
      const total = known ? usdVolumeByRoute[route].reduce((s: number, v) => s + (v ?? 0), 0) : null;
      return [route, total];
    }),
  ) as Record<Route, number | null>;

  const assetTotalsByRoute = Object.fromEntries(
    ROUTE_ORDER.map((route) => [
      route,
      Array.from(assetAccum.get(route)!.entries())
        .map(([asset, { count, usd }]) => ({ asset, transferCount: count, usdVolume: usd }))
        .sort((a, b) => b.transferCount - a.transferCount),
    ]),
  ) as Record<Route, AssetTotal[]>;

  const totalTransfers = breakdown.reduce((sum, r) => sum + r.transferCount, 0);
  const totalUsdVolume = usdVolumeKnown.some(Boolean)
    ? usdVolume.reduce((sum: number, v) => sum + (v ?? 0), 0)
    : null;
  const mostUsedRoute = breakdown.length > 0
    ? breakdown.reduce((best, r) => (r.transferCount > best.transferCount ? r : best)).route
    : null;

  return {
    bucketStarts,
    countByRoute,
    usdVolumeByRoute,
    usdVolume,
    routeBreakdown: breakdown,
    routeCountTotals,
    routeVolumeTotals,
    assetTotalsByRoute,
    totalTransfers,
    totalUsdVolume,
    mostUsedRoute,
    stats,
  };
}
