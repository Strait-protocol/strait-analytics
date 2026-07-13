"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsSummary, Granularity } from "@/lib/analytics";
import { OUTFLOW_ROUTES, ROUTE_ORDER, routeColor, routeLabel, type Route } from "@/lib/colors";
import { formatCount } from "@/lib/format";
import { transformSeriesToChart } from "@/lib/transform";
import EmptyChart from "./EmptyChart";

const AXIS_STYLE = {
  tick: { fill: "#4A5060", fontFamily: "var(--font-mono)", fontSize: 10 },
  axisLine: { stroke: "#1A1D24" },
  tickLine: false,
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface2)] border border-[var(--border2)] px-4 py-3 font-mono text-[11px]">
      <div className="text-[var(--muted)] mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: routeColor(p.name) }} className="mb-1">
          {routeLabel(p.name)}: {formatCount(p.value)}
        </div>
      ))}
    </div>
  );
}

export default function CountChart({ summary, granularity }: { summary: AnalyticsSummary; granularity: Granularity }) {
  if (summary.bucketStarts.length === 0) {
    return <EmptyChart message="No transfers in this window yet" height={260} />;
  }

  const data = transformSeriesToChart(summary, granularity, "count");

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#1A1D24" strokeOpacity={0.5} strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey="date" {...AXIS_STYLE} />
        <YAxis {...AXIS_STYLE} tickFormatter={(v: number) => formatCount(v)} width={40} />
        <Tooltip content={<CustomTooltip />} />
        {ROUTE_ORDER.map((route) => (
          <Line
            key={route}
            type="monotone"
            dataKey={route}
            name={route}
            stroke={routeColor(route)}
            strokeWidth={1.5}
            strokeDasharray={OUTFLOW_ROUTES.includes(route as Route) ? "4 2" : undefined}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
