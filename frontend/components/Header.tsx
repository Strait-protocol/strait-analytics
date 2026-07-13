import { Suspense } from "react";
import { Stack, Typography } from "@mui/material";
import Nav from "./Nav";

export default function Header() {
  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Strait Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tunnel activity across Hemi&apos;s Bitcoin and Ethereum bridges.
        </Typography>
      </Stack>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
    </Stack>
  );
}
