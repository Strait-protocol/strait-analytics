"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { ROUTE_LABEL, ROUTE_ORDER, routeColor, type Route } from "@/lib/palette";
import { formatBucketLabel } from "@/lib/format";
import type { Granularity } from "@/lib/strait";

export default function CountChart({
  bucketStarts,
  countByRoute,
  granularity,
}: {
  bucketStarts: string[];
  countByRoute: Record<Route, number[]>;
  granularity: Granularity;
}) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  if (bucketStarts.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No transfers in this window yet.</Typography>
      </Box>
    );
  }

  const xLabels = bucketStarts.map((b) => formatBucketLabel(b, granularity));

  return (
    <LineChart
      height={280}
      xAxis={[{ scaleType: "point", data: xLabels }]}
      series={ROUTE_ORDER.map((route) => ({
        id: route,
        label: ROUTE_LABEL[route],
        data: countByRoute[route],
        area: true,
        stack: "total",
        color: routeColor(route, mode),
        showMark: false,
      }))}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "center" } } }}
      grid={{ horizontal: true }}
    />
  );
}
