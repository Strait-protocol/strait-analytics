import { buildAnalyticsViewModel, type AnalyticsViewModel } from "./analytics";
import { isNetworkConfigured, type Granularity, type Network, type TimeWindow } from "./strait";

export type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseWindow(value: string | undefined): TimeWindow {
  return (["LAST_24H", "LAST_7D", "LAST_30D", "ALL_TIME"] as const).includes(value as TimeWindow)
    ? (value as TimeWindow)
    : "LAST_7D";
}

function parseGranularity(value: string | undefined): Granularity {
  return (["DAY", "WEEK", "MONTH"] as const).includes(value as Granularity)
    ? (value as Granularity)
    : "DAY";
}

function parseNetwork(value: string | undefined): Network {
  return value === "testnet" ? "testnet" : "mainnet";
}

export interface ResolvedPageData {
  window: TimeWindow;
  granularity: Granularity;
  network: Network;
  testnetConfigured: boolean;
  error: string | null;
  vm: AnalyticsViewModel | null;
}

/** Parses window/granularity/network from URL search params and fetches the
 * shared analytics view model — used by every page (overview + per-tunnel). */
export async function resolvePageData(searchParams: PageSearchParams): Promise<ResolvedPageData> {
  const params = await searchParams;
  const get = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]);

  const window = parseWindow(get("window"));
  const granularity = parseGranularity(get("granularity"));
  const network = parseNetwork(get("network"));

  const testnetConfigured = await isNetworkConfigured("testnet");
  const configured = await isNetworkConfigured(network);

  let error: string | null = null;
  let vm: AnalyticsViewModel | null = null;

  if (!configured) {
    error = `No API URL configured for ${network}.`;
  } else {
    try {
      vm = await buildAnalyticsViewModel(network, window, granularity);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load analytics data.";
    }
  }

  return { window, granularity, network, testnetConfigured, error, vm };
}
