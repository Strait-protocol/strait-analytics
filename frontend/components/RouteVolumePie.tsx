"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { ROUTE_LABEL, ROUTE_ORDER, routeColor, type Route } from "@/lib/palette";
import { formatUsd } from "@/lib/format";

export default function RouteVolumePie({
  routeVolumeTotals,
  routes = ROUTE_ORDER,
}: {
  routeVolumeTotals: Record<Route, number | null>;
  routes?: readonly Route[];
}) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const data = routes.filter((route) => (routeVolumeTotals[route] ?? 0) > 0).map((route) => ({
    id: route,
    label: ROUTE_LABEL[route],
    value: routeVolumeTotals[route] as number,
    color: routeColor(route, mode),
  }));

  if (data.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">
          No USD-priceable volume in this window yet (BTC/ETH only for now).
        </Typography>
      </Box>
    );
  }

  return (
    <PieChart
      height={260}
      series={[
        {
          data,
          innerRadius: 50,
          paddingAngle: 2,
          cornerRadius: 4,
          valueFormatter: (item) => formatUsd(item.value),
        },
      ]}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "center" } } }}
    />
  );
}
