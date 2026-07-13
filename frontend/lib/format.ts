const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const countFormatter = new Intl.NumberFormat("en-US", { notation: "compact" });

export function formatUsd(value: number | null): string {
  if (value == null) return "—";
  return usdFormatter.format(value);
}

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatPercent(share: number): string {
  return `${(share * 100).toFixed(1)}%`;
}

export function formatBucketLabel(bucketStart: string, granularity: "DAY" | "WEEK" | "MONTH"): string {
  const d = new Date(bucketStart);
  if (granularity === "MONTH") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
