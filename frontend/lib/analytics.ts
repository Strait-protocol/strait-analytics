/**
 * Shapes raw `analyticsSeries` / `routeBreakdown` GraphQL data plus CoinGecko
 * prices into the arrays the chart components render. Kept out of page.tsx so
 * the fetch-and-combine logic is testable independent of JSX.
 */
import { getAnalyticsSeries, getRouteBreakdown, type Granularity, type Network, type TimeWindow } from "./strait";
import { getCurrentPrice, getHistoricalPrices, atomicToUsd } from "./prices";
import { ROUTE_ORDER, type Route } from "./palette";

export interface AnalyticsViewModel {
  /** Chronological bucket labels (ISO bucketStart), one per x-axis tick. */
  bucketStarts: string[];
  /** Per-route transfer count aligned with `bucketStarts`. */
  countByRoute: Record<Route, number[]>;
  /** Total USD volume aligned with `bucketStarts` (null entries = unpriced). */
  usdVolume: (number | null)[];
  routeBreakdown: { route: string; transferCount: number; share: number }[];
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
  const usdVolume: (number | null)[] = bucketStarts.map(() => null);
  const usdVolumeKnown: boolean[] = bucketStarts.map(() => false);

  for (const bucket of buckets) {
    const idx = bucketStarts.indexOf(bucket.bucketStart);
    if (idx === -1) continue;
    if (ROUTE_ORDER.includes(bucket.route as Route)) {
      countByRoute[bucket.route as Route][idx] += bucket.transferCount;
    }
    const usd = atomicToUsd(bucket.asset, bucket.volume, priceFor(bucket.asset, bucket.bucketStart));
    if (usd != null) {
      usdVolume[idx] = (usdVolume[idx] ?? 0) + usd;
      usdVolumeKnown[idx] = true;
    }
  }
  // Buckets with no priceable asset (e.g. only unresolved ERC-20 rows) stay null
  // rather than showing as a misleading $0.
  for (let i = 0; i < usdVolume.length; i++) {
    if (!usdVolumeKnown[i]) usdVolume[i] = null;
  }

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
    usdVolume,
    routeBreakdown: breakdown,
    totalTransfers,
    totalUsdVolume,
    mostUsedRoute,
  };
}
