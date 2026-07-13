import { NextRequest, NextResponse } from "next/server";
import { getWhaleTransfers } from "@/lib/whales";
import { isNetworkConfigured, GraphQLUpstreamError, type Network } from "@/lib/graphql";

const DEFAULT_THRESHOLD_USD = 10_000;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const network: Network = params.get("network") === "testnet" ? "testnet" : "mainnet";
  const threshold = Number(params.get("threshold")) || DEFAULT_THRESHOLD_USD;

  if (!isNetworkConfigured(network)) {
    return NextResponse.json({ error: `No API URL configured for ${network}` }, { status: 503 });
  }

  try {
    const whales = await getWhaleTransfers(network, threshold);
    return NextResponse.json({ whales });
  } catch (e) {
    const message = e instanceof GraphQLUpstreamError ? e.message : "Unexpected error fetching whale transfers";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
