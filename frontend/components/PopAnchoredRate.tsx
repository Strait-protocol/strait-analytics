import type { Stats } from "@/lib/analytics";
import { formatCount } from "@/lib/format";

export default function PopAnchoredRate({ stats }: { stats: Stats }) {
  const rate = stats.totalTransfers > 0 ? (stats.popAnchored / stats.totalTransfers) * 100 : 0;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] p-5" style={{ borderTop: "2px solid #F7931A" }}>
      <div className="font-mono text-[10px] tracking-[1px] text-[var(--muted)] uppercase mb-2.5">
        BTC-Anchored Rate
      </div>
      <div className="font-mono text-[36px] font-bold" style={{ color: "#F7931A" }}>
        {rate.toFixed(1)}%
      </div>
      <div className="font-mono text-[10px] text-[var(--muted)] mt-1">
        {formatCount(stats.popAnchored)} transfers Bitcoin-final (all time)
      </div>
      <div className="text-[10px] text-[var(--muted)] leading-relaxed mt-3">
        Transfers confirmed by Hemi&apos;s PoP keystone anchoring — secured by Bitcoin&apos;s proof-of-work.
      </div>
    </div>
  );
}
