"use client";

import type { TimeWindow } from "@/lib/analytics";
import type { Network } from "@/lib/graphql";

const WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "LAST_24H", label: "24H" },
  { value: "LAST_7D", label: "7D" },
  { value: "LAST_30D", label: "30D" },
  { value: "ALL_TIME", label: "ALL" },
];

const NETWORKS: { value: Network; label: string }[] = [
  { value: "mainnet", label: "Mainnet" },
  { value: "testnet", label: "Testnet" },
];

export default function Header({
  window,
  network,
  onWindowChange,
  onNetworkChange,
  testnetConfigured,
}: {
  window: TimeWindow;
  network: Network;
  onWindowChange: (w: TimeWindow) => void;
  onNetworkChange: (n: Network) => void;
  testnetConfigured: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-[52px] items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-5">
      <div className="font-mono text-sm font-bold tracking-wide text-[var(--accent)]">STRAIT ANALYTICS</div>

      <div className="flex items-center gap-4">
        <div className="flex gap-[2px]">
          {NETWORKS.map((n) => {
            const active = network === n.value;
            const disabled = n.value === "testnet" && !testnetConfigured;
            return (
              <button
                key={n.value}
                disabled={disabled}
                onClick={() => onNetworkChange(n.value)}
                className="px-3 py-1 font-mono text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: active ? "var(--surface2)" : "transparent",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  color: active ? "var(--accent)" : "var(--muted)",
                }}
              >
                {n.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-[2px]">
          {WINDOWS.map((w) => {
            const active = window === w.value;
            return (
              <button
                key={w.value}
                onClick={() => onWindowChange(w.value)}
                className="px-3 py-1 font-mono text-[11px]"
                style={{
                  background: active ? "var(--surface2)" : "transparent",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  color: active ? "var(--accent)" : "var(--muted)",
                }}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
