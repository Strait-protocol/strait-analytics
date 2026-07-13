/**
 * GraphQL client for the Strait indexer API. Reads the same `analyticsSeries` /
 * `routeBreakdown` / `stats` fields strait-api exposes over HTTP — no shared
 * package with the tunnel-explorer dashboard, just the same wire protocol.
 */

export type TimeWindow = "LAST_24H" | "LAST_7D" | "LAST_30D" | "ALL_TIME";
export type Granularity = "DAY" | "WEEK" | "MONTH";
export type Network = "mainnet" | "testnet";

export interface AnalyticsBucket {
  bucketStart: string;
  route: string;
  asset: string;
  transferCount: number;
  volume: string;
}

export interface RouteBreakdownEntry {
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

function apiUrlFor(network: Network): string | null {
  if (network === "testnet") {
    return process.env.STRAIT_TESTNET_API_URL ?? null;
  }
  return process.env.STRAIT_API_URL ?? "http://localhost:8080/graphql";
}

class StraitApiError extends Error {}

async function straitQuery<T>(
  network: Network,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const url = apiUrlFor(network);
  if (!url) {
    throw new StraitApiError(`No API URL configured for ${network}`);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // Aggregate data changes slowly; a short revalidate window keeps page
    // loads fast without serving stale-for-long data.
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new StraitApiError(`Strait API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new StraitApiError(json.errors.map((e: { message: string }) => e.message).join("; "));
  }
  return json.data as T;
}

export async function isNetworkConfigured(network: Network): Promise<boolean> {
  return apiUrlFor(network) !== null;
}

export async function getAnalyticsSeries(
  network: Network,
  window: TimeWindow,
  granularity: Granularity,
): Promise<AnalyticsBucket[]> {
  const data = await straitQuery<{ analyticsSeries: AnalyticsBucket[] }>(
    network,
    `query AnalyticsSeries($window: TimeWindow!, $granularity: Granularity!) {
      analyticsSeries(window: $window, granularity: $granularity) {
        bucketStart
        route
        asset
        transferCount
        volume
      }
    }`,
    { window, granularity },
  );
  return data.analyticsSeries;
}

export async function getRouteBreakdown(
  network: Network,
  window: TimeWindow,
): Promise<RouteBreakdownEntry[]> {
  const data = await straitQuery<{ routeBreakdown: RouteBreakdownEntry[] }>(
    network,
    `query RouteBreakdown($window: TimeWindow!) {
      routeBreakdown(window: $window) {
        route
        transferCount
        share
      }
    }`,
    { window },
  );
  return data.routeBreakdown;
}

export async function getStats(network: Network): Promise<Stats> {
  const data = await straitQuery<{ stats: Stats }>(
    network,
    `query Stats {
      stats {
        totalTransfers
        initiated
        anchored
        proving
        finalized
        failed
        reorged
        popAnchored
      }
    }`,
  );
  return data.stats;
}
