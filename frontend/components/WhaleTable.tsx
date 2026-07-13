import Card from "./Card";
import EmptyChart from "./EmptyChart";
import type { WhaleTransfer } from "@/lib/whales";
import { ASSET_DECIMALS } from "@/lib/assets";
import { routeColor, routeLabel, statusColor } from "@/lib/colors";
import { formatUsd, timeAgo } from "@/lib/format";

const th = "px-3.5 py-2.5 font-mono text-[9px] tracking-[1px] text-[var(--muted)] border-b border-[var(--border)] text-left uppercase";
const td = "px-3.5 py-2.5 border-b border-[var(--border)] font-mono text-xs";

function formatAmount(asset: string, amount: string): string {
  const decimals = ASSET_DECIMALS[asset];
  if (decimals == null) return `${amount} ${asset}`;
  const value = Number(amount) / 10 ** decimals;
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${asset}`;
}

export default function WhaleTable({ whales }: { whales: WhaleTransfer[] }) {
  return (
    <Card title="Whale Activity" subtitle="Transfers over $10,000 USD">
      {whales.length === 0 ? (
        <EmptyChart message="No large transfers in this window" height={140} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Route</th>
                <th className={`${th} text-right`}>Amount</th>
                <th className={`${th} text-right`}>USD Value</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Age</th>
              </tr>
            </thead>
            <tbody>
              {whales.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--surface2)]">
                  <td className={td} style={{ color: routeColor(t.route) }}>
                    {routeLabel(t.route)}
                  </td>
                  <td className={`${td} text-right`}>{formatAmount(t.asset, t.amount)}</td>
                  <td className={`${td} text-right text-[var(--text)]`}>{formatUsd(t.usdValue)}</td>
                  <td className={td}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor(t.status) }} />
                      {t.status}
                    </span>
                  </td>
                  <td className={`${td} text-right text-[var(--muted)]`}>{timeAgo(t.initiatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
