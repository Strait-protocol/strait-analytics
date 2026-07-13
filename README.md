# Strait Analytics

A standalone analytics dashboard for [Strait](https://github.com/Godbrand0/strait), the
reorg-safe tunnel indexer for Hemi Network. It visualizes tunnel activity over
time — transaction counts and USD-denominated volume, broken down by route and
time window — as its own product, not a page bolted onto Strait's tunnel-explorer
dashboard.

See [`docs/analytics-page-plan.md`](docs/analytics-page-plan.md) for the original
design doc this was built against.

## What it shows

- **Transaction count over time** — stacked area chart, one series per tunnel
  route (`BTC_TO_HEMI`, `ETH_TO_HEMI`, `HEMI_TO_BTC`, `HEMI_TO_ETH`).
- **USD volume over time** — a single unified series, converting each route/asset's
  atomic-unit volume (sats/wei) to USD at the historical price for that day. This
  is the chart cross-asset summing was blocked on before USD conversion existed.
- **Route breakdown** — stacked horizontal bar showing which route dominates in
  the selected window, with each route's share of total transfers.
- **Headline stat tiles** — total transfers, total USD volume, and the most-used
  route for the selected window, with sparkline trends.

Controls: time window (24h / 7d / 30d / all-time), granularity (day / week /
month), and a network toggle (mainnet / testnet), all wired as URL search params
so a given view is shareable/bookmarkable.

## Architecture

```
strait-analytics/
├── frontend/          # This app — Next.js (App Router), MUI + MUI X Charts
│   ├── app/           # Pages, layout, theme
│   ├── components/    # Chart + control components (all client components)
│   └── lib/           # GraphQL client, price client, data shaping, formatting
└── docs/              # Design docs
```

This app is a **pure GraphQL client** over Strait's indexer API — it holds no
indexing logic and no database connection of its own. It reads:

- `analyticsSeries(window, granularity)` and `routeBreakdown(window)` — two
  additive GraphQL queries added to `strait-api` (in the separate
  [`strait`](https://github.com/Godbrand0/strait) repo) specifically to back this
  dashboard. They return atomic-unit volumes only — **no USD conversion happens
  in the indexer**, by design (see the plan doc's rationale).
- `stats` — existing global indexer stats.

USD conversion happens entirely in this app (`lib/prices.ts`), using CoinGecko:

- **Historical daily prices** (`/coins/{id}/market_chart/range`) price each
  time-bucket's volume at that bucket's date — a transfer from three months ago
  is valued at that day's price, not today's. Closed days never change, so
  they're cached indefinitely in a local JSON file (`.cache/`, gitignored).
- **Current price** (`/simple/price`) values today's partial bucket, revalidated
  every 60s, falling back to the last-known price if CoinGecko fails or
  rate-limits rather than breaking the chart.
- Only **BTC and ETH** are priced today — bridged ERC-20s need a per-token
  CoinGecko id mapped from contract address, not yet built. Buckets with no
  priceable asset show as unpriced (not a misleading $0).

## Local development

### 1. Run the Strait indexer API locally

This app needs a running `strait-api` GraphQL endpoint. From the `strait` repo:

```bash
DATABASE_URL='postgres://...' cargo run -p strait-api --example serve
# → http://127.0.0.1:8080/graphql
```

### 2. Run this app

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

Configure `frontend/.env.local`:

```bash
STRAIT_API_URL=http://localhost:8080/graphql
# STRAIT_TESTNET_API_URL=  # optional — a second strait-api instance indexing testnet
```

If `STRAIT_TESTNET_API_URL` is unset, the testnet toggle is disabled rather than
erroring.

## Tech stack

- **Next.js (App Router)** — server components fetch + shape data; chart/control
  components are client components.
- **MUI + MUI X Charts** — `LineChart` (stacked area for counts, single-series
  area for USD volume), `BarChart` (stacked horizontal for route breakdown),
  `SparkLineChart` (stat tile trends).
- Categorical route colors are fixed (never reassigned when filters change which
  routes are present) and colorblind-validated, per the project's data-viz
  guidelines.

## Known limitations

- ERC-20 tunnel volume is not yet priced (BTC/ETH only).
- Testnet requires a separately deployed `strait-api` instance pointed at
  `STRAIT_TESTNET_API_URL`; not configured by default.
- The historical price cache is a local JSON file — fine for a single
  long-lived server, but needs a hosted store if this app is deployed to a
  serverless/edge platform with no persistent disk.
