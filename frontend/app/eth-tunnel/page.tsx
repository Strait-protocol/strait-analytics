import { Suspense } from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import Header from "@/components/Header";
import Controls from "@/components/Controls";
import TunnelPageContent from "@/components/TunnelPageContent";
import { resolvePageData, type PageSearchParams } from "@/lib/pageData";

const ROUTES = ["ETH_TO_HEMI", "HEMI_TO_ETH"] as const;

export default async function EthTunnelPage({ searchParams }: { searchParams: PageSearchParams }) {
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

          {vm && <TunnelPageContent vm={vm} granularity={granularity} routes={ROUTES} showAssetBreakdown />}
        </Stack>
      </Container>
    </Box>
  );
}
