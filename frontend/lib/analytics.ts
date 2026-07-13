/**
 * Shapes raw `analyticsSeries` / `routeBreakdown` GraphQL data plus CoinGecko
 * prices into the arrays the chart components render. Kept out of page.tsx so
 * the fetch-and-combine logic is testable independent of JSX.
 *
 * Fetches the full (unfiltered, all-route) dataset once; individual pages
 * (overview, per-tunnel) slice the parts of this model they need rather than
 * re-fetching with different route filters.
 */
import { getAnalyticsSeries, getRouteBreakdown, type Granularity, type Network, type TimeWindow } from "./strait";
import { getCurrentPrice, getHistoricalPrices, atomicToUsd } from "./prices";
import { ROUTE_ORDER, type Route } from "./palette";

export interface AssetTotal {
  asset: string;
  transferCount: number;
  /** Total USD volume for this asset, or null if it isn't priced yet (e.g. ERC-20s beyond BTC/ETH). */
  usdVolume: number | null;
}

export interface AnalyticsViewModel {
  /** Chronological bucket labels (ISO bucketStart), one per x-axis tick. */
  bucketStarts: string[];
  /** Per-route transfer count aligned with `bucketStarts`. */
  countByRoute: Record<Route, number[]>;
  /** Per-route USD volume aligned with `bucketStarts` (null entries = unpriced bucket). */
  usdVolumeByRoute: Record<Route, (number | null)[]>;
  /** Total USD volume across all routes, aligned with `bucketStarts`. */
  usdVolume: (number | null)[];
  routeBreakdown: { route: string; transferCount: number; share: number }[];
  /** Window-total transfer count per route. */
  routeCountTotals: Record<Route, number>;
  /** Window-total USD volume per route (null if nothing priceable moved on that route). */
  routeVolumeTotals: Record<Route, number | null>;
  /** Per-route, per-asset totals — e.g. the ETH tunnel's ERC-20 breakdown. */
  assetTotalsByRoute: Record<Route, AssetTotal[]>;
  totalTransfers: number;
  totalUsdVolume: number | null;
  mostUsedRoute: string | null;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function buildAnalyticsViewModel(
  network: Network,
  window: TimeWindow,
  granularity: Granularity,
): Promise<AnalyticsViewModel> {
  const [buckets, breakdown] = await Promise.all([
    getAnalyticsSeries(network, window, granularity),
    getRouteBreakdown(network, window),
  ]);

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

  // route -> asset -> { count, usd (null until first priced hit) }
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

  // Buckets with no priceable asset (e.g. only unresolved ERC-20 rows) stay null
  // rather than showing as a misleading $0.
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
  };
}
