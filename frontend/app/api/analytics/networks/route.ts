import { NextResponse } from "next/server";
import { isNetworkConfigured } from "@/lib/graphql";

export async function GET() {
  return NextResponse.json({
    mainnet: isNetworkConfigured("mainnet"),
    testnet: isNetworkConfigured("testnet"),
  });
}
