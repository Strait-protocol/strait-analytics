import { NextRequest, NextResponse } from "next/server";
import { getFinalityTimesByRoute } from "@/lib/finality";
import { isNetworkConfigured, GraphQLUpstreamError, type Network } from "@/lib/graphql";

export async function GET(req: NextRequest) {
  const network: Network = req.nextUrl.searchParams.get("network") === "testnet" ? "testnet" : "mainnet";

  if (!isNetworkConfigured(network)) {
    return NextResponse.json({ error: `No API URL configured for ${network}` }, { status: 503 });
  }

  try {
    const finalityByRoute = await getFinalityTimesByRoute(network);
    return NextResponse.json({ finalityByRoute });
  } catch (e) {
    const message = e instanceof GraphQLUpstreamError ? e.message : "Unexpected error computing finality times";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
