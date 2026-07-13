import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { AssetTotal } from "@/lib/analytics";
import { formatCount, formatUsd } from "@/lib/format";

export default function AssetBreakdownTable({ assets }: { assets: AssetTotal[] }) {
  if (assets.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No transfers in this window yet.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell align="right">Transfers</TableCell>
            <TableCell align="right">USD volume</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((a) => (
            <TableRow key={a.asset || "unknown"}>
              <TableCell>{a.asset || "Unresolved"}</TableCell>
              <TableCell align="right">{formatCount(a.transferCount)}</TableCell>
              <TableCell align="right">{formatUsd(a.usdVolume)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
