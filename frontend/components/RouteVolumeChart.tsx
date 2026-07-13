"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { ROUTE_LABEL, routeColor, type Route } from "@/lib/palette";
import { formatBucketLabel, formatUsd } from "@/lib/format";
import type { Granularity } from "@/lib/strait";

/** Per-route USD volume over time — unlike the overview's single total series,
 * this shows each route's contribution separately so direction/route volume
 * can be compared directly. */
export default function RouteVolumeChart({
  bucketStarts,
  usdVolumeByRoute,
  granularity,
  routes,
}: {
  bucketStarts: string[];
  usdVolumeByRoute: Record<Route, (number | null)[]>;
  granularity: Granularity;
  routes: readonly Route[];
}) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const hasData = routes.some((route) => usdVolumeByRoute[route]?.some((v) => v != null));
  if (bucketStarts.length === 0 || !hasData) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">
          No USD-priceable volume in this window yet (BTC/ETH only for now).
        </Typography>
      </Box>
    );
  }

  const xLabels = bucketStarts.map((b) => formatBucketLabel(b, granularity));

  return (
    <LineChart
      height={280}
      xAxis={[{ scaleType: "point", data: xLabels }]}
      yAxis={[{ valueFormatter: (v: number) => formatUsd(v) }]}
      series={routes.map((route) => ({
        id: route,
        label: ROUTE_LABEL[route],
        data: usdVolumeByRoute[route].map((v) => v ?? 0),
        area: true,
        color: routeColor(route, mode),
        showMark: false,
        valueFormatter: (v: number | null) => formatUsd(v),
      }))}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "center" } } }}
      grid={{ horizontal: true }}
    />
  );
}
