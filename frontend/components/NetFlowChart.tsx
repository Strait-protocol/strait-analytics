"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsSummary, Granularity } from "@/lib/analytics";
import { formatUsd } from "@/lib/format";
import { transformToNetFlow } from "@/lib/transform";
import EmptyChart from "./EmptyChart";

const AXIS_STYLE = {
  tick: { fill: "#4A5060", fontFamily: "var(--font-mono)", fontSize: 10 },
  axisLine: { stroke: "#1A1D24" },
  tickLine: false,
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const byName = Object.fromEntries(payload.map((p) => [p.name, p.value]));
  return (
    <div className="bg-[var(--surface2)] border border-[var(--border2)] px-4 py-3 font-mono text-[11px]">
      <div className="text-[var(--muted)] mb-2">{label}</div>
      <div style={{ color: "var(--hemi)" }} className="mb-1">
        Inflow: {formatUsd(byName.inflow)}
      </div>
      <div style={{ color: "var(--accent)" }} className="mb-1">
        Outflow: {formatUsd(Math.abs(byName.outflow ?? 0))}
      </div>
      <div className="text-[var(--text)] border-t border-[var(--border)] pt-1.5 mt-1.5">
        Net: {formatUsd(byName.net)}
      </div>
    </div>
  );
}

export default function NetFlowChart({ summary, granularity }: { summary: AnalyticsSummary; granularity: Granularity }) {
  if (summary.bucketStarts.length === 0 || summary.usdVolume.every((v) => v == null)) {
    return <EmptyChart message="No USD-priceable volume in this window (BTC/ETH only for now)" height={260} />;
  }

  const data = transformToNetFlow(summary, granularity);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#1A1D24" strokeOpacity={0.5} strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey="date" {...AXIS_STYLE} />
        <YAxis {...AXIS_STYLE} tickFormatter={(v: number) => formatUsd(v)} width={56} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="inflow" name="inflow" fill="#00C8A0" />
        <Bar dataKey="outflow" name="outflow" fill="#FF5C00" />
        <Line type="monotone" dataKey="net" name="net" stroke="#D4D8E0" strokeWidth={1.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
