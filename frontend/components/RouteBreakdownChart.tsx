"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { ROUTE_LABEL, ROUTE_ORDER, routeColor, type Route } from "@/lib/palette";
import { formatPercent } from "@/lib/format";

export default function RouteBreakdownChart({
  breakdown,
}: {
  breakdown: { route: string; transferCount: number; share: number }[];
}) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  if (breakdown.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No transfers in this window yet.</Typography>
      </Box>
    );
  }

  const byRoute = Object.fromEntries(breakdown.map((r) => [r.route, r]));

  return (
    <BarChart
      height={140}
      layout="horizontal"
      yAxis={[{ scaleType: "band", data: ["Transfers"] }]}
      series={ROUTE_ORDER.filter((route) => byRoute[route]).map((route) => ({
        id: route,
        label: ROUTE_LABEL[route],
        data: [byRoute[route].transferCount],
        stack: "total",
        color: routeColor(route, mode),
        valueFormatter: () => `${byRoute[route].transferCount} (${formatPercent(byRoute[route].share)})`,
      }))}
      grid={{ vertical: true }}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "center" } } }}
      borderRadius={4}
    />
  );
}
