"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "./Card";
import type { Stats } from "@/lib/analytics";
import { statusColor } from "@/lib/colors";
import { formatCount } from "@/lib/format";

const STATUS_ORDER: { key: keyof Stats; label: string }[] = [
  { key: "initiated", label: "INITIATED" },
  { key: "anchored", label: "ANCHORED" },
  { key: "proving", label: "PROVING" },
  { key: "finalized", label: "FINALIZED" },
  { key: "failed", label: "FAILED" },
  { key: "reorged", label: "REORGED" },
];

export default function StatusDonut({ stats }: { stats: Stats }) {
  const data = STATUS_ORDER.map(({ key, label }) => ({ label, value: stats[key] })).filter((d) => d.value > 0);
  const total = stats.totalTransfers;

  return (
    <Card title="Status Distribution">
      <div className="relative" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={75} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.label} fill={statusColor(d.label)} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCount(Number(value)), name]}
              contentStyle={{
                background: "var(--surface2)",
                border: "1px solid var(--border2)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xl font-bold text-[var(--text)]">{formatCount(total)}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full" style={{ background: statusColor(d.label) }} />
            {d.label} · {formatCount(d.value)}
          </div>
        ))}
      </div>
    </Card>
  );
}
