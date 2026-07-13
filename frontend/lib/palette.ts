/**
 * Categorical colors for the four tunnel routes, in a fixed order so a route's
 * color never repaints when filters change which routes are present.
 * Hues from the validated dataviz reference palette (slots 1-4: blue/aqua/yellow/green).
 */
export const ROUTE_ORDER = ["BTC_TO_HEMI", "ETH_TO_HEMI", "HEMI_TO_BTC", "HEMI_TO_ETH"] as const;
export type Route = (typeof ROUTE_ORDER)[number];

export const ROUTE_COLOR: Record<Route, { light: string; dark: string }> = {
  BTC_TO_HEMI: { light: "#2a78d6", dark: "#3987e5" },
  ETH_TO_HEMI: { light: "#1baf7a", dark: "#199e70" },
  HEMI_TO_BTC: { light: "#eda100", dark: "#c98500" },
  HEMI_TO_ETH: { light: "#008300", dark: "#008300" },
};

export const ROUTE_LABEL: Record<Route, string> = {
  BTC_TO_HEMI: "BTC → Hemi",
  ETH_TO_HEMI: "ETH → Hemi",
  HEMI_TO_BTC: "Hemi → BTC",
  HEMI_TO_ETH: "Hemi → ETH",
};

export function routeColor(route: string, mode: "light" | "dark"): string {
  const entry = ROUTE_COLOR[route as Route];
  if (entry) return entry[mode];
  // Unknown/future route falls back to muted ink rather than an unplanned hue.
  return mode === "dark" ? "#898781" : "#898781";
}
