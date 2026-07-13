"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsSummary, Granularity, TimeWindow } from "./analytics";
import type { Route } from "./colors";
import type { Network } from "./graphql";
import type { WhaleTransfer } from "./whales";

const REFETCH_INTERVAL_MS = 60_000;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`);
  return json as T;
}

export function useAnalyticsSummary(network: Network, window: TimeWindow, granularity: Granularity) {
  return useQuery({
    queryKey: ["analytics-summary", network, window, granularity],
    queryFn: () =>
      fetchJson<AnalyticsSummary>(
        `/api/analytics/summary?network=${network}&window=${window}&granularity=${granularity}`,
      ),
    refetchInterval: REFETCH_INTERVAL_MS,
    staleTime: REFETCH_INTERVAL_MS - 5_000,
  });
}

export function useFinalityTimes(network: Network) {
  return useQuery({
    queryKey: ["analytics-finality", network],
    queryFn: () =>
      fetchJson<{ finalityByRoute: Record<Route, number | null> }>(`/api/analytics/finality?network=${network}`),
    refetchInterval: REFETCH_INTERVAL_MS,
    staleTime: REFETCH_INTERVAL_MS - 5_000,
  });
}

export function useWhaleTransfers(network: Network) {
  return useQuery({
    queryKey: ["analytics-whales", network],
    queryFn: () => fetchJson<{ whales: WhaleTransfer[] }>(`/api/analytics/whales?network=${network}`),
    refetchInterval: REFETCH_INTERVAL_MS,
    staleTime: REFETCH_INTERVAL_MS - 5_000,
  });
}

/** Which networks have an API URL configured — doesn't change at runtime, so no polling. */
export function useAvailableNetworks() {
  return useQuery({
    queryKey: ["analytics-networks"],
    queryFn: () => fetchJson<{ mainnet: boolean; testnet: boolean }>("/api/analytics/networks"),
    staleTime: Infinity,
  });
}
