"use client";

import { Suspense } from "react";
import Header from "@/components/Header";
import StatsRow from "@/components/StatsRow";
import Card from "@/components/Card";
import VolumeChart from "@/components/VolumeChart";
import CountChart from "@/components/CountChart";
import NetFlowChart from "@/components/NetFlowChart";
import RouteBreakdown from "@/components/RouteBreakdown";
import StatusDonut from "@/components/StatusDonut";
import FinalityTime from "@/components/FinalityTime";
import PopAnchoredRate from "@/components/PopAnchoredRate";
import WhaleTable from "@/components/WhaleTable";
import ChartSkeleton from "@/components/ChartSkeleton";
import Footer from "@/components/Footer";
import { useAnalyticsParams } from "@/lib/params";
import { useAnalyticsSummary, useAvailableNetworks, useFinalityTimes, useWhaleTransfers } from "@/lib/hooks";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const { window, granularity, network, setWindow, setNetwork } = useAnalyticsParams();

  const summaryQuery = useAnalyticsSummary(network, window, granularity);
  const finalityQuery = useFinalityTimes(network);
  const whalesQuery = useWhaleTransfers(network);
  const networksQuery = useAvailableNetworks();

  const summary = summaryQuery.data;
  const error = summaryQuery.error instanceof Error ? summaryQuery.error.message : null;

  return (
    <div className="flex flex-col flex-1">
      <Header
        window={window}
        network={network}
        onWindowChange={setWindow}
        onNetworkChange={setNetwork}
        testnetConfigured={networksQuery.data?.testnet ?? false}
      />

      <main className="flex-1 px-5 py-6">
        {error && (
          <div className="mb-6 border border-[var(--border)] bg-[var(--surface)] p-5 font-mono text-xs text-[var(--muted)]">
            {error}
          </div>
        )}

        {summaryQuery.isLoading || !summary ? (
          <div className="mb-6">
            <ChartSkeleton height={112} />
          </div>
        ) : (
          <div className="mb-6">
            <StatsRow summary={summary} finalityByRoute={finalityQuery.data?.finalityByRoute} window={window} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
          <div className="flex flex-col gap-4">
            <Card title="Volume (USD)">
              {summaryQuery.isLoading || !summary ? <ChartSkeleton height={260} /> : (
                <VolumeChart summary={summary} granularity={granularity} />
              )}
            </Card>

            <Card title="Transaction Count">
              {summaryQuery.isLoading || !summary ? <ChartSkeleton height={260} /> : (
                <CountChart summary={summary} granularity={granularity} />
              )}
            </Card>

            <Card title="Capital Flow" subtitle="Inflow vs outflow through Hemi tunnels">
              {summaryQuery.isLoading || !summary ? <ChartSkeleton height={260} /> : (
                <NetFlowChart summary={summary} granularity={granularity} />
              )}
            </Card>

            {whalesQuery.isLoading || !whalesQuery.data ? (
              <ChartSkeleton height={200} />
            ) : (
              <WhaleTable whales={whalesQuery.data.whales} />
            )}
          </div>

          <div className="flex flex-col gap-4">
            {summaryQuery.isLoading || !summary ? (
              <ChartSkeleton height={160} />
            ) : (
              <RouteBreakdown breakdown={summary.routeBreakdown} />
            )}

            {summaryQuery.isLoading || !summary ? (
              <ChartSkeleton height={220} />
            ) : (
              <StatusDonut stats={summary.stats} />
            )}

            {finalityQuery.isLoading || !finalityQuery.data ? (
              <ChartSkeleton height={160} />
            ) : (
              <FinalityTime finalityByRoute={finalityQuery.data.finalityByRoute} />
            )}

            {summaryQuery.isLoading || !summary ? (
              <ChartSkeleton height={160} />
            ) : (
              <PopAnchoredRate stats={summary.stats} window={window} />
            )}
          </div>
        </div>
      </main>

      <Footer lastUpdated={summaryQuery.dataUpdatedAt || null} />
    </div>
  );
}
