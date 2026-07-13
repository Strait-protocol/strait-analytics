"use client";

import { Box, Paper, Typography, useTheme } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

export default function StatTile({
  label,
  value,
  sparkline,
  color,
}: {
  label: string;
  value: string;
  sparkline?: number[];
  color?: string;
}) {
  const theme = useTheme();
  const hasSparkline = sparkline && sparkline.length > 1 && sparkline.some((v) => v !== 0);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minWidth: 0,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h4" component="p" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {hasSparkline && (
          <Box sx={{ width: 96, height: 36, flexShrink: 0 }}>
            <SparkLineChart
              data={sparkline}
              height={36}
              width={96}
              curve="linear"
              color={color ?? theme.palette.primary.main}
              showHighlight={false}
              showTooltip={false}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
}
