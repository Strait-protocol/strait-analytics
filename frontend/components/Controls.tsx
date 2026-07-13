"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Box, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { Granularity, Network, TimeWindow } from "@/lib/strait";

const WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: "LAST_24H", label: "24h" },
  { value: "LAST_7D", label: "7d" },
  { value: "LAST_30D", label: "30d" },
  { value: "ALL_TIME", label: "All time" },
];

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "DAY", label: "Day" },
  { value: "WEEK", label: "Week" },
  { value: "MONTH", label: "Month" },
];

export default function Controls({
  window,
  granularity,
  network,
  testnetConfigured,
}: {
  window: TimeWindow;
  granularity: Granularity;
  network: Network;
  testnetConfigured: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 3,
        rowGap: 1.5,
      }}
    >
      <ToggleButtonGroup
        size="small"
        value={network}
        exclusive
        onChange={(_, value) => value && setParam("network", value)}
        aria-label="network"
      >
        <ToggleButton value="mainnet">Mainnet</ToggleButton>
        <ToggleButton value="testnet" disabled={!testnetConfigured}>
          Testnet
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Window
        </Typography>
        <Select
          size="small"
          value={window}
          onChange={(e) => setParam("window", e.target.value)}
        >
          {WINDOW_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Granularity
        </Typography>
        <Select
          size="small"
          value={granularity}
          onChange={(e) => setParam("granularity", e.target.value)}
        >
          {GRANULARITY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}
