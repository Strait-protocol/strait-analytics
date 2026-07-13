/**
 * Server-side upstream resolution for the Strait GraphQL API. Only this
 * module (and the /api/graphql route handler that calls it) ever reads
 * STRAIT_API_URL / STRAIT_TESTNET_API_URL — the browser talks to our own
 * /api/graphql proxy, never directly to the upstream, so the network→URL
 * mapping stays server-side config rather than a client-shipped constant.
 */
export type Network = "mainnet" | "testnet";

export class GraphQLUpstreamError extends Error {}

function upstreamUrl(network: Network): string | null {
  if (network === "testnet") return process.env.STRAIT_TESTNET_API_URL ?? null;
  return process.env.STRAIT_API_URL ?? "http://localhost:8080/graphql";
}

export function isNetworkConfigured(network: Network): boolean {
  return upstreamUrl(network) !== null;
}

export async function forwardGraphQL(
  network: Network,
  query: string,
  variables?: Record<string, unknown>,
): Promise<unknown> {
  const url = upstreamUrl(network);
  if (!url) {
    throw new GraphQLUpstreamError(`No API URL configured for ${network}`);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new GraphQLUpstreamError(`Strait API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new GraphQLUpstreamError(json.errors.map((e: { message: string }) => e.message).join("; "));
  }
  return json.data;
}
