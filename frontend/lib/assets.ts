/** Pure asset constants — no fs/network access, safe to import client-side
 * (unlike lib/prices.ts, which touches the filesystem for its price cache). */
export const ASSET_DECIMALS: Record<string, number> = {
  BTC: 8,
  ETH: 18,
};
