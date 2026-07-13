"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { formatBucketLabel, formatUsd } from "@/lib/format";
import type { Granularity } from "@/lib/strait";

export default function VolumeChart({
  bucketStarts,
  usdVolume,
  granularity,
}: {
  bucketStarts: string[];
  usdVolume: (number | null)[];
  granularity: Granularity;
}) {
  const theme = useTheme();

  if (bucketStarts.length === 0 || usdVolume.every((v) => v == null)) {
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
      series={[
        {
          id: "usd-volume",
          label: "USD volume",
          data: usdVolume,
          area: true,
          color: theme.palette.mode === "dark" ? "#3987e5" : "#2a78d6",
          showMark: false,
          valueFormatter: (v: number | null) => formatUsd(v),
        },
      ]}
      grid={{ horizontal: true }}
      hideLegend
    />
  );
}
