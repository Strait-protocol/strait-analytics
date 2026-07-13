import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import Controls from "@/components/Controls";
import StatTile from "@/components/StatTile";
import CountChart from "@/components/CountChart";
import VolumeChart from "@/components/VolumeChart";
import RouteBreakdownChart from "@/components/RouteBreakdownChart";
import { buildAnalyticsViewModel } from "@/lib/analytics";
import { isNetworkConfigured, type Granularity, type Network, type TimeWindow } from "@/lib/strait";
import { formatCount, formatUsd } from "@/lib/format";
import { ROUTE_LABEL, ROUTE_ORDER, type Route } from "@/lib/palette";

function parseWindow(value: string | undefined): TimeWindow {
  return (["LAST_24H", "LAST_7D", "LAST_30D", "ALL_TIME"] as const).includes(value as TimeWindow)
    ? (value as TimeWindow)
    : "LAST_7D";
}

function parseGranularity(value: string | undefined): Granularity {
  return (["DAY", "WEEK", "MONTH"] as const).includes(value as Granularity)
    ? (value as Granularity)
    : "DAY";
}

function parseNetwork(value: string | undefined): Network {
  return value === "testnet" ? "testnet" : "mainnet";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]);

  const window = parseWindow(get("window"));
  const granularity = parseGranularity(get("granularity"));
  const network = parseNetwork(get("network"));

  const testnetConfigured = await isNetworkConfigured("testnet");
  const configured = await isNetworkConfigured(network);

  let error: string | null = null;
  let vm: Awaited<ReturnType<typeof buildAnalyticsViewModel>> | null = null;

  if (!configured) {
    error = `No API URL configured for ${network}.`;
  } else {
    try {
      vm = await buildAnalyticsViewModel(network, window, granularity);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load analytics data.";
    }
  }

  return (
    <Box component="main" sx={{ flex: 1, py: { xs: 3, sm: 5 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Strait Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tunnel activity across Hemi&apos;s Bitcoin and Ethereum bridges.
            </Typography>
          </Stack>

          <Controls
            window={window}
            granularity={granularity}
            network={network}
            testnetConfigured={testnetConfigured}
          />

          {error && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography color="text.secondary">{error}</Typography>
            </Paper>
          )}

          {vm && (
            <>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatTile
                    label={`Transfers (${window.replace("_", " ").toLowerCase()})`}
                    value={formatCount(vm.totalTransfers)}
                    sparkline={vm.bucketStarts.map((_, i) =>
                      ROUTE_ORDER.reduce((sum, r) => sum + vm.countByRoute[r][i], 0),
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatTile
                    label="USD volume (BTC + ETH)"
                    value={formatUsd(vm.totalUsdVolume)}
                    sparkline={vm.usdVolume.map((v) => v ?? 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatTile
                    label="Most-used route"
                    value={vm.mostUsedRoute ? ROUTE_LABEL[vm.mostUsedRoute as Route] ?? vm.mostUsedRoute : "—"}
                  />
                </Grid>
              </Grid>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Transaction count over time
                </Typography>
                <CountChart bucketStarts={vm.bucketStarts} countByRoute={vm.countByRoute} granularity={granularity} />
              </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  USD volume over time
                </Typography>
                <VolumeChart bucketStarts={vm.bucketStarts} usdVolume={vm.usdVolume} granularity={granularity} />
              </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Route breakdown
                </Typography>
                <RouteBreakdownChart breakdown={vm.routeBreakdown} />
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
