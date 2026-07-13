/** Recent large transfers ("whale activity"), priced in USD. Only BTC/ETH
 * transfers are priceable today, so only those can be threshold-filtered —
 * everything else is excluded rather than shown with a fabricated $0. */
import { forwardGraphQL, type Network } from "./graphql";
import { RECENT_TRANSFERS_QUERY } from "./queries";
import { getCurrentPrice, atomicToUsd } from "./prices";

export interface WhaleTransfer {
  id: string;
  route: string;
  asset: string;
  amount: string;
  usdValue: number;
  status: string;
  popAnchored: boolean;
  initiatedAt: string;
}

const FETCH_LIMIT = 100;

export async function getWhaleTransfers(network: Network, thresholdUsd = 10_000): Promise<WhaleTransfer[]> {
  const data = (await forwardGraphQL(network, RECENT_TRANSFERS_QUERY, { limit: FETCH_LIMIT })) as {
    transfers: {
      id: string;
      route: string;
      asset: string;
      amount: string;
      status: string;
      popAnchored: boolean;
      initiatedAt: string;
    }[];
  };

  const [btcPrice, ethPrice] = await Promise.all([getCurrentPrice("BTC"), getCurrentPrice("ETH")]);
  const priceFor = (asset: string) => (asset === "BTC" ? btcPrice : asset === "ETH" ? ethPrice : null);

  return data.transfers
    .map((t) => {
      const usdValue = atomicToUsd(t.asset, t.amount, priceFor(t.asset));
      return usdValue != null ? { ...t, usdValue } : null;
    })
    .filter((t): t is WhaleTransfer => t != null && t.usdValue >= thresholdUsd)
    .sort((a, b) => b.usdValue - a.usdValue)
    .slice(0, 10);
}
