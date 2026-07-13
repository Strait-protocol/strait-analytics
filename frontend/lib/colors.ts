/** Color tokens mirrored from the Strait Explorer's design system, so both
 * products read as one platform. Keep in sync with the CSS variables in
 * app/globals.css — these are the JS-side copies Recharts needs as plain
 * strings (SVG fill/stroke can't read CSS custom properties reliably across
 * all Recharts internals).
 */
export const ROUTE_ORDER = ["BTC_TO_HEMI", "HEMI_TO_BTC", "ETH_TO_HEMI", "HEMI_TO_ETH"] as const;
export type Route = (typeof ROUTE_ORDER)[number];

export const ROUTE_COLORS: Record<Route, string> = {
  BTC_TO_HEMI: "#F7931A",
  HEMI_TO_BTC: "#C4600D",
  ETH_TO_HEMI: "#8B9CF4",
  HEMI_TO_ETH: "#5B6EC4",
};

export const ROUTE_LABELS: Record<Route, string> = {
  BTC_TO_HEMI: "BTC → Hemi",
  HEMI_TO_BTC: "Hemi → BTC",
  ETH_TO_HEMI: "ETH → Hemi",
  HEMI_TO_ETH: "Hemi → ETH",
};

/** Inflow routes (capital entering Hemi) vs outflow (leaving Hemi). */
export const INFLOW_ROUTES: Route[] = ["BTC_TO_HEMI", "ETH_TO_HEMI"];
export const OUTFLOW_ROUTES: Route[] = ["HEMI_TO_BTC", "HEMI_TO_ETH"];

/** Full lifecycle statuses as strait-api actually reports them (the design
 * spec's 4-color set omits PROVING/FAILED, which are real states here). */
export const STATUS_COLORS: Record<string, string> = {
  INITIATED: "#F59E0B",
  ANCHORED: "#627EEA",
  PROVING: "#00C8A0",
  FINALIZED: "#22C55E",
  FAILED: "#F97316",
  REORGED: "#EF4444",
};

export const ASSET_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#8B9CF4",
};

export function routeColor(route: string): string {
  return ROUTE_COLORS[route as Route] ?? "#4A5060";
}

export function routeLabel(route: string): string {
  return ROUTE_LABELS[route as Route] ?? route;
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#4A5060";
}
