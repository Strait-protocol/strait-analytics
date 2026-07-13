"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Granularity, TimeWindow } from "./analytics";
import type { Network } from "./graphql";

const WINDOWS: TimeWindow[] = ["LAST_24H", "LAST_7D", "LAST_30D", "ALL_TIME"];

function granularityFor(window: TimeWindow): Granularity {
  if (window === "ALL_TIME") return "MONTH";
  if (window === "LAST_30D") return "DAY";
  return "DAY";
}

/** URL-backed window/network state (`/?window=7D&network=mainnet`) — a given
 * dashboard view is shareable/bookmarkable, and every chart on the page reads
 * from the same source of truth. */
export function useAnalyticsParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const windowParam = searchParams.get("window");
  const window: TimeWindow = WINDOWS.includes(windowParam as TimeWindow) ? (windowParam as TimeWindow) : "LAST_7D";
  const network: Network = searchParams.get("network") === "testnet" ? "testnet" : "mainnet";
  const granularity = granularityFor(window);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setWindow = useCallback((value: TimeWindow) => setParam("window", value), [setParam]);
  const setNetwork = useCallback((value: Network) => setParam("network", value), [setParam]);

  return useMemo(
    () => ({ window, granularity, network, setWindow, setNetwork }),
    [window, granularity, network, setWindow, setNetwork],
  );
}
