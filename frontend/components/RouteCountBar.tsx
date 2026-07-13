"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { ROUTE_LABEL, ROUTE_ORDER, routeColor, type Route } from "@/lib/palette";

export default function RouteCountBar({
  routeCountTotals,
  routes: routeFilter = ROUTE_ORDER,
}: {
  routeCountTotals: Record<Route, number>;
  routes?: readonly Route[];
}) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const routes = routeFilter.filter((route) => routeCountTotals[route] > 0);

  if (routes.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No transfers in this window yet.</Typography>
      </Box>
    );
  }

  return (
    <BarChart
      height={260}
      xAxis={[{ scaleType: "band", data: ["Transfers"] }]}
      series={routes.map((route) => ({
        id: route,
        label: ROUTE_LABEL[route],
        data: [routeCountTotals[route]],
        color: routeColor(route, mode),
      }))}
      grid={{ horizontal: true }}
      borderRadius={4}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "center" } } }}
    />
  );
}
