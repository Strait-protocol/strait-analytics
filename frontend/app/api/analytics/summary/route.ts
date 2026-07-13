import { NextRequest, NextResponse } from "next/server";
import { buildAnalyticsSummary, type Granularity, type TimeWindow } from "@/lib/analytics";
import { isNetworkConfigured, GraphQLUpstreamError, type Network } from "@/lib/graphql";

const WINDOWS: TimeWindow[] = ["LAST_24H", "LAST_7D", "LAST_30D", "ALL_TIME"];
const GRANULARITIES: Granularity[] = ["DAY", "WEEK", "MONTH"];

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const network: Network = params.get("network") === "testnet" ? "testnet" : "mainnet";
  const window = (WINDOWS.includes(params.get("window") as TimeWindow) ? params.get("window") : "LAST_7D") as TimeWindow;
  const granularity = (GRANULARITIES.includes(params.get("granularity") as Granularity)
    ? params.get("granularity")
    : "DAY") as Granularity;

  if (!isNetworkConfigured(network)) {
    return NextResponse.json({ error: `No API URL configured for ${network}` }, { status: 503 });
  }

  try {
    const summary = await buildAnalyticsSummary(network, window, granularity);
    return NextResponse.json(summary);
  } catch (e) {
    const message = e instanceof GraphQLUpstreamError ? e.message : "Unexpected error building analytics summary";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
