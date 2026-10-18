
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analytics, type Range } from "@/data/mockData";
import { PageTitle, Panel } from "@/components/kit";
import {
  Bars,
  TrendArea,
  TrendLine,
  MaxSummary,
} from "@/components/Charts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — GearUp" },
      {
        name: "description",
        content:
          "Trends for temperature, gases, air quality, batteries, alerts and attendance.",
      },
      { property: "og:title", content: "Analytics — GearUp" },
      {
        property: "og:description",
        content:
          "Trends for temperature, gases, air quality, batteries, alerts and attendance.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const ranges: [Range, string][] = [
  ["24h", "Last 24 hours"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
];

function AnalyticsPage() {
  const [range, setRange] = useState<Range>("24h");
  const d = analytics(range);

  return (
    <>
      <PageTitle
        title="Analytics"
        sub="Historical trends · Currently using mock data"
        action={
          <div className="flex flex-wrap rounded-sm border bg-card p-0.5">
            {ranges.map(([r, label]) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`rounded-sm px-3 py-1.5 font-mono text-xs ${
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Temperature */}
        <Panel title="Temperature trend (°C)">
          <TrendArea
            data={d.env}
            x="t"
            series={[
              {
                key: "temperature",
                name: "Temperature",
                color: "var(--chart-1)",
              },
            ]}
          />
          <MaxSummary
            data={d.env}
            x="t"
            series={[
              {
                key: "temperature",
                name: "Temperature",
                color: "var(--chart-1)",
              },
            ]}
            unit="°C"
          />
        </Panel>

        {/* Humidity */}
        <Panel title="Humidity trend (%)">
          <TrendArea
            data={d.env}
            x="t"
            series={[
              {
                key: "humidity",
                name: "Humidity",
                color: "var(--chart-2)",
              },
            ]}
          />
          <MaxSummary
            data={d.env}
            x="t"
            series={[
              {
                key: "humidity",
                name: "Humidity",
                color: "var(--chart-2)",
              },
            ]}
            unit="%"
          />
        </Panel>

        {/* Methane */}
        <Panel title="Methane trend (ppm)">
          <TrendLine
            data={d.env}
            x="t"
            series={[
              {
                key: "methane",
                name: "Methane",
                color: "var(--chart-4)",
              },
            ]}
          />
          <MaxSummary
            data={d.env}
            x="t"
            series={[
              {
                key: "methane",
                name: "Methane",
                color: "var(--chart-4)",
              },
            ]}
            unit="ppm"
          />
        </Panel>

        {/* Air quality */}
        <Panel title="Air quality trend (AQI)">
          <TrendLine
            data={d.env}
            x="t"
            series={[
              {
                key: "aqi",
                name: "Air quality",
                color: "var(--chart-3)",
              },
            ]}
          />
          <MaxSummary
            data={d.env}
            x="t"
            series={[
              {
                key: "aqi",
                name: "Air quality",
                color: "var(--chart-3)",
              },
            ]}
            unit="AQI"
          />
        </Panel>

        {/* Battery */}
        <Panel title="Helmet battery levels (%)">
          <Bars
            data={d.battery}
            x="t"
            series={[
              {
                key: "battery",
                name: "Battery",
                color: "var(--chart-1)",
              },
            ]}
          />
          <MaxSummary
            data={d.battery}
            x="t"
            series={[
              {
                key: "battery",
                name: "Battery",
                color: "var(--chart-1)",
              },
            ]}
            unit="%"
          />
        </Panel>

        {/* Alerts */}
        <Panel title="Alerts over time">
          <Bars
            data={d.alerts}
            x="t"
            stacked
            series={[
              {
                key: "critical",
                name: "Critical alerts",
                color: "var(--crit)",
              },
              {
                key: "warning",
                name: "Warning alerts",
                color: "var(--warn)",
              },
            ]}
          />
          <MaxSummary
            data={d.alerts}
            x="t"
            stacked
            series={[
              {
                key: "critical",
                name: "Critical alerts",
                color: "var(--crit)",
              },
              {
                key: "warning",
                name: "Warning alerts",
                color: "var(--warn)",
              },
            ]}
            unit="alerts"
          />
        </Panel>

        {/* Attendance */}
        <div className="lg:col-span-2">
          <Panel title="Attendance statistics">
            <Bars
              data={d.attendance}
              x="t"
              stacked
              series={[
                {
                  key: "present",
                  name: "Present",
                  color: "var(--ok)",
                },
                {
                  key: "late",
                  name: "Late",
                  color: "var(--warn)",
                },
                {
                  key: "absent",
                  name: "Absent",
                  color: "var(--crit)",
                },
              ]}
              h={260}
            />
            <MaxSummary
              data={d.attendance}
              x="t"
              stacked
              series={[
                {
                  key: "present",
                  name: "Present",
                  color: "var(--ok)",
                },
                {
                  key: "late",
                  name: "Late",
                  color: "var(--warn)",
                },
                {
                  key: "absent",
                  name: "Absent",
                  color: "var(--crit)",
                },
              ]}
              unit="people"
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
