import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analytics, type Range } from "@/data/mockData";
import { PageTitle, Panel } from "@/components/kit";
import { Bars, TrendArea, TrendLine } from "@/components/Charts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — GearUp" },
      { name: "description", content: "Trends for temperature, gases, air quality, batteries, alerts and attendance." },
      { property: "og:title", content: "Analytics — GearUp" },
      { property: "og:description", content: "Trends for temperature, gases, air quality, batteries, alerts and attendance." },
    ],
  }),
  component: AnalyticsPage,
});

const ranges: [Range, string][] = [["24h", "Last 24 hours"], ["7d", "Last 7 days"], ["30d", "Last 30 days"]];

function AnalyticsPage() {
  const [range, setRange] = useState<Range>("24h");
  const d = analytics(range);
  return (
    <>
      <PageTitle
        title="Analytics"
        sub="Mock historical data"
        action={
          <div className="flex rounded-sm border bg-card p-0.5">
            {ranges.map(([r, l]) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-sm px-3 py-1.5 font-mono text-xs ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Temperature trend (°C)"><TrendArea data={d.env} x="t" series={[{ key: "temperature", color: "var(--chart-1)" }]} /></Panel>
        <Panel title="Humidity trend (%)"><TrendArea data={d.env} x="t" series={[{ key: "humidity", color: "var(--chart-2)" }]} /></Panel>
        <Panel title="Methane trend (ppm)"><TrendLine data={d.env} x="t" series={[{ key: "methane", color: "var(--chart-4)" }]} /></Panel>
        <Panel title="Air quality trend (AQI)"><TrendLine data={d.env} x="t" series={[{ key: "aqi", color: "var(--chart-3)" }]} /></Panel>
        <Panel title="Helmet battery levels (%)"><Bars data={d.battery} x="t" series={[{ key: "battery", color: "var(--chart-1)" }]} /></Panel>
        <Panel title="Alerts over time"><Bars data={d.alerts} x="t" stacked series={[{ key: "critical", color: "var(--crit)" }, { key: "warning", color: "var(--warn)" }]} /></Panel>
        <Panel title="Attendance statistics" className="lg:col-span-2"><Bars data={d.attendance} x="t" stacked series={[{ key: "present", color: "var(--ok)" }, { key: "late", color: "var(--warn)" }, { key: "absent", color: "var(--crit)" }]} h={260} /></Panel>
      </div>
    </>
  );
}
