/**
 * USD price conversion for tunnel volumes. Lives here, not in strait-api —
 * the indexer only knows atomic units (sats/wei); pricing is a presentation
 * concern of this app.
 *
 * Two lookups, because historical accuracy matters for a "volume over time"
 * chart: today's BTC price would misrepresent a transfer from three months ago.
 *  - Historical daily prices: fetched once per asset/range, cached indefinitely
 *    (closed days never change) in a JSON file under .cache/.
 *  - Current price: revalidated every 60s, falls back to the last cached value
 *    on failure/rate-limit rather than showing an error.
 */
import fs from "node:fs/promises";
import path from "node:path";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CACHE_DIR = path.join(process.cwd(), ".cache");
const HISTORICAL_CACHE_FILE = path.join(CACHE_DIR, "coingecko-historical.json");

// Start with BTC/ETH only — bridged ERC-20s need a per-token CoinGecko id
// mapping from contract address, not yet built (see docs/analytics-page-plan.md).
const ASSET_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

/** Atomic-unit decimals per asset, for converting to whole-coin amounts. */
export const ASSET_DECIMALS: Record<string, number> = {
  BTC: 8,
  ETH: 18,
};

type HistoricalCache = Record<string, Record<string, number>>; // coingeckoId -> "YYYY-MM-DD" -> USD price

let memoryCache: HistoricalCache | null = null;
let currentPriceCache: { prices: Record<string, number>; fetchedAt: number } | null = null;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function loadCache(): Promise<HistoricalCache> {
  if (memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(HISTORICAL_CACHE_FILE, "utf-8");
    memoryCache = JSON.parse(raw);
  } catch {
    memoryCache = {};
  }
  return memoryCache!;
}

async function saveCache(cache: HistoricalCache): Promise<void> {
  memoryCache = cache;
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(HISTORICAL_CACHE_FILE, JSON.stringify(cache), "utf-8");
  } catch {
    // No writable disk (e.g. serverless/edge deploy) — memory cache still
    // helps within this process's lifetime; see plan's open question on deployment.
  }
}

/**
 * Daily USD prices for `asset` covering [from, to], keyed by "YYYY-MM-DD".
 * Returns {} for assets with no known CoinGecko id (ERC-20s, unresolved assets).
 */
export async function getHistoricalPrices(
  asset: string,
  from: Date,
  to: Date,
): Promise<Record<string, number>> {
  const coinId = ASSET_TO_COINGECKO_ID[asset];
  if (!coinId) return {};

  const cache = await loadCache();
  const assetCache = cache[coinId] ?? {};
  const today = dayKey(new Date());

  const missingDays: string[] = [];
  for (const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = dayKey(d);
    if (key !== today && !(key in assetCache)) missingDays.push(key);
  }

  if (missingDays.length > 0) {
    try {
      const fromTs = Math.floor(from.getTime() / 1000);
      const toTs = Math.floor(to.getTime() / 1000);
      const res = await fetch(
        `${COINGECKO_BASE}/coins/${coinId}/market_chart/range?vs_currency=usd&from=${fromTs}&to=${toTs}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data: { prices?: [number, number][] } = await res.json();
        for (const [ts, price] of data.prices ?? []) {
          const key = dayKey(new Date(ts));
          if (key !== today) assetCache[key] = price;
        }
        cache[coinId] = assetCache;
        await saveCache(cache);
      }
      // Non-OK (e.g. 429 rate limit) — fall through and serve whatever's cached.
    } catch {
      // Network failure — serve whatever's cached; missing days come back undefined.
    }
  }

  return assetCache;
}

/**
 * Current USD price for `asset`, revalidated at most every 60s. Falls back to
 * the last successfully fetched price if CoinGecko fails or rate-limits.
 */
export async function getCurrentPrice(asset: string): Promise<number | null> {
  const coinId = ASSET_TO_COINGECKO_ID[asset];
  if (!coinId) return null;

  const now = Date.now();
  if (currentPriceCache && now - currentPriceCache.fetchedAt < 60_000) {
    return currentPriceCache.prices[coinId] ?? null;
  }

  try {
    const ids = Object.values(ASSET_TO_COINGECKO_ID).join(",");
    const res = await fetch(`${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data: Record<string, { usd: number }> = await res.json();
      const prices: Record<string, number> = {};
      for (const id of Object.values(ASSET_TO_COINGECKO_ID)) {
        if (data[id]?.usd != null) prices[id] = data[id].usd;
      }
      currentPriceCache = { prices, fetchedAt: now };
      return prices[coinId] ?? null;
    }
  } catch {
    // fall through to stale cache
  }
  return currentPriceCache?.prices[coinId] ?? null;
}

/** Convert an atomic-unit amount (string, e.g. wei/sats) to USD given a price. Null if the asset/price is unknown. */
export function atomicToUsd(asset: string, amountAtomic: string, priceUsd: number | null): number | null {
  if (priceUsd == null) return null;
  const decimals = ASSET_DECIMALS[asset];
  if (decimals == null) return null;
  const amount = Number(amountAtomic) / 10 ** decimals;
  return amount * priceUsd;
}
