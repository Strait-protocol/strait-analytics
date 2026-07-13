import { Box, Paper, Typography } from "@mui/material";
import { formatCount, formatUsd } from "@/lib/format";

export default function RouteStatCard({
  label,
  color,
  transferCount,
  usdVolume,
}: {
  label: string;
  color: string;
  transferCount: number;
  usdVolume: number | null;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
        {formatCount(transferCount)} <Typography component="span" variant="body2" color="text.secondary">transfers</Typography>
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {formatUsd(usdVolume)} volume
      </Typography>
    </Paper>
  );
}
