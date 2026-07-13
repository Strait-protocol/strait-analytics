import { Grid, Paper, Typography } from "@mui/material";
import RouteStatCard from "./RouteStatCard";
import CountChart from "./CountChart";
import RouteVolumeChart from "./RouteVolumeChart";
import RouteVolumePie from "./RouteVolumePie";
import AssetBreakdownTable from "./AssetBreakdownTable";
import type { AnalyticsViewModel } from "@/lib/analytics";
import type { Granularity } from "@/lib/strait";
import { ROUTE_LABEL, routeColor, type Route } from "@/lib/palette";

export default function TunnelPageContent({
  vm,
  granularity,
  routes,
  showAssetBreakdown = false,
}: {
  vm: AnalyticsViewModel;
  granularity: Granularity;
  routes: readonly [Route, Route];
  showAssetBreakdown?: boolean;
}) {
  return (
    <>
      <Grid container spacing={2}>
        {routes.map((route) => (
          <Grid key={route} size={{ xs: 12, sm: 6 }}>
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
        <CountChart
          bucketStarts={vm.bucketStarts}
          countByRoute={vm.countByRoute}
          granularity={granularity}
          routes={routes}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          USD volume over time, by direction
        </Typography>
        <RouteVolumeChart
          bucketStarts={vm.bucketStarts}
          usdVolumeByRoute={vm.usdVolumeByRoute}
          granularity={granularity}
          routes={routes}
        />
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: showAssetBreakdown ? 6 : 12 }}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Volume share by direction
            </Typography>
            <RouteVolumePie routeVolumeTotals={vm.routeVolumeTotals} routes={routes} />
          </Paper>
        </Grid>
        {showAssetBreakdown && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Asset breakdown
              </Typography>
              <AssetBreakdownTable
                assets={routes.flatMap((route) => vm.assetTotalsByRoute[route])}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </>
  );
}
