/** GraphQL query strings against strait-api's actual schema.
 *
 * Note: strait-api has no `tunnelStats` or `recentTransfers` fields (checked
 * against the live schema) — status distribution and "in flight" counts are
 * derived from `stats`, average finality time is sampled from `searchTransfers`
 * client-side (see lib/finality.ts), and the whale table reuses `transfers`.
 */

export const ANALYTICS_SERIES_QUERY = `
  query AnalyticsSeries($window: TimeWindow!, $granularity: Granularity!) {
    analyticsSeries(window: $window, granularity: $granularity) {
      bucketStart
      route
      asset
      transferCount
      volume
    }
  }
`;

export const ROUTE_BREAKDOWN_QUERY = `
  query RouteBreakdown($window: TimeWindow!) {
    routeBreakdown(window: $window) {
      route
      transferCount
      share
    }
  }
`;

export const STATS_QUERY = `
  query Stats {
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
  }
`;

export const RECENT_TRANSFERS_QUERY = `
  query RecentTransfers($limit: Int) {
    transfers(limit: $limit) {
      id
      route
      asset
      amount
      status
      sourceChain
      sourceTxHash
      popAnchored
      initiatedAt
      finalizedAt
    }
  }
`;

export const FINALIZED_TRANSFERS_BY_ROUTE_QUERY = `
  query FinalizedTransfersByRoute($route: String!, $limit: Int) {
    searchTransfers(route: $route, status: "FINALIZED", limit: $limit) {
      initiatedAt
      finalizedAt
    }
  }
`;
