"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

export default function Footer({ lastUpdated }: { lastUpdated: number | null }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-[var(--border)] px-5 py-4 text-center font-mono text-[10px] text-[var(--muted)]">
      Powered by Strait Indexer · Data refreshes every 60s
      {lastUpdated && <> · Updated {timeAgo(new Date(lastUpdated).toISOString())}</>}
    </footer>
  );
}
