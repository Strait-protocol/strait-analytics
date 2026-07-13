/**
 * Average finality time per route. strait-api has no aggregation query for
 * this, so we sample recent FINALIZED transfers per route via `searchTransfers`
 * (which already supports route+status filters) and average
 * finalizedAt - initiatedAt client-side. A sample of the most recent 200 is a
 * reasonable approximation without adding a new backend resolver.
 */
import { forwardGraphQL, type Network } from "./graphql";
import { FINALIZED_TRANSFERS_BY_ROUTE_QUERY } from "./queries";
import { ROUTE_ORDER, type Route } from "./colors";

const SAMPLE_SIZE = 200;

export async function getFinalityTimesByRoute(network: Network): Promise<Record<Route, number | null>> {
  const results = await Promise.all(
    ROUTE_ORDER.map(async (route) => {
      const data = (await forwardGraphQL(network, FINALIZED_TRANSFERS_BY_ROUTE_QUERY, {
        route,
        limit: SAMPLE_SIZE,
      })) as { searchTransfers: { initiatedAt: string; finalizedAt: string | null }[] };

      const durations = data.searchTransfers
        .filter((t) => t.finalizedAt != null)
        .map((t) => (new Date(t.finalizedAt!).getTime() - new Date(t.initiatedAt).getTime()) / 1000)
        .filter((s) => s >= 0);

      if (durations.length === 0) return [route, null] as const;
      const avg = durations.reduce((sum, s) => sum + s, 0) / durations.length;
      return [route, avg] as const;
    }),
  );

  return Object.fromEntries(results) as Record<Route, number | null>;
}
