import { Suspense } from "react";
import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import Header from "@/components/Header";
import Controls from "@/components/Controls";
import StatTile from "@/components/StatTile";
import RouteStatCard from "@/components/RouteStatCard";
import CountChart from "@/components/CountChart";
import VolumeChart from "@/components/VolumeChart";
import RouteBreakdownChart from "@/components/RouteBreakdownChart";
import RouteVolumePie from "@/components/RouteVolumePie";
import RouteCountBar from "@/components/RouteCountBar";
import { resolvePageData, type PageSearchParams } from "@/lib/pageData";
import { formatCount, formatUsd } from "@/lib/format";
import { ROUTE_LABEL, ROUTE_ORDER, routeColor, type Route } from "@/lib/palette";

export default async function Page({ searchParams }: { searchParams: PageSearchParams }) {
  const { window, granularity, network, testnetConfigured, error, vm } = await resolvePageData(searchParams);

  return (
    <Box component="main" sx={{ flex: 1, py: { xs: 3, sm: 5 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Header />

          <Suspense fallback={null}>
            <Controls
              window={window}
              granularity={granularity}
              network={network}
              testnetConfigured={testnetConfigured}
            />
          </Suspense>

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

              <Grid container spacing={2}>
                {ROUTE_ORDER.map((route) => (
                  <Grid key={route} size={{ xs: 12, sm: 6, md: 3 }}>
                    <RouteStatCard
                      label={ROUTE_LABEL[route]}
                      color={routeColor(route, "light")}
                      transferCount={vm.routeCountTotals[route]}
                      usdVolume={vm.routeVolumeTotals[route]}
                    />
                  </Grid>
                ))}
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

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Volume share by route
                    </Typography>
                    <RouteVolumePie routeVolumeTotals={vm.routeVolumeTotals} />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Transfers by route
                    </Typography>
                    <RouteCountBar routeCountTotals={vm.routeCountTotals} />
                  </Paper>
                </Grid>
              </Grid>

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
