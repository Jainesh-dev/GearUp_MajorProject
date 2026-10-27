
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
  Activity,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  helmets,
  overallHealth,
  type Overall,
} from "@/data/mockData";

import {
  Dot,
  PageTitle,
  StatCard,
  StatusBadge,
  batteryTone,
  toneOf,
  type Tone,
} from "@/components/kit";

import { TrendArea } from "@/components/Charts";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Helmet Health — GearUp" },
      {
        name: "description",
        content:
          "Technical health of smart helmets with live sensor readings and individual helmet history.",
      },
      { property: "og:title", content: "Helmet Health — GearUp" },
      {
        property: "og:description",
        content:
          "Technical health of smart helmets with live sensor readings and individual helmet history.",
      },
    ],
  }),
  component: HealthPage,
});

const API_URL = "http://127.0.0.1:8000";

const HEALTH_HELMET_IDS = ["H001", "H002", "H003"] as const;
const CAROUSEL_INTERVAL = 5000;
const REFRESH_INTERVAL = 3000;

const cols = [
  "ESP32",
  "MQ4",
  "MQ135",
  "MQ2",
  "DHT22",
  "ADXL345",
  "LoRa",
  "GPS",
] as const;

type LiveHelmetData = {
  helmet_id: string;
  miner_name: string | null;
  zone: string | null;
  status: string;
  battery: number | null;
  last_seen?: string | null;
  temperature: number | null;
  humidity: number | null;
  mq4: number | null;
  mq135: number | null;
  mq2: number | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  impact: boolean | null;
  timestamp: string | null;
};

type SensorReading = {
  id: number;
  helmet_id: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  mq4: number | null;
  mq135: number | null;
  mq2: number | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  impact: boolean | null;
  battery: number | null;
};

type HelmetLiveState = {
  data: LiveHelmetData | null;
  readings: SensorReading[];
  error: string | null;
  historyError: string | null;
  loading: boolean;
};

const overallTone: Record<Overall, Tone> = {
  Healthy: "ok",
  Warning: "warn",
  Critical: "crit",
  Offline: "off",
};

function formatValue(
  value: number | null | undefined,
  decimals = 1,
) {
  return value == null || !Number.isFinite(value)
    ? "--"
    : value.toFixed(decimals);
}

function formatTimestamp(timestamp: string | null | undefined) {
  if (!timestamp) return "--";

  const date = new Date(timestamp);

  return Number.isNaN(date.getTime())
    ? "--"
    : date.toLocaleString();
}

function formatTimeAxis(timestamp: string) {
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime())
    ? timestamp
    : date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
}

function isOnline(data: LiveHelmetData | null | undefined) {
  return data?.status?.toLowerCase() === "online";
}

function Mark({ v }: { v: string }) {
  const t = toneOf(v);

  if (t === "ok") {
    return <Check className="mx-auto size-4 text-ok" />;
  }

  if (t === "warn") {
    return (
      <TriangleAlert className="mx-auto size-4 text-warn" />
    );
  }

  if (t === "off") {
    return <Minus className="mx-auto size-4 text-off" />;
  }

  return <X className="mx-auto size-4 text-crit" />;
}

async function fetchLatest(
  helmetId: string,
): Promise<LiveHelmetData> {
  const response = await fetch(
    `${API_URL}/api/helmets/${helmetId}/latest`,
  );

  if (!response.ok) {
    throw new Error(`Latest data request failed (${response.status})`);
  }

  return response.json();
}

async function fetchReadings(
  helmetId: string,
): Promise<SensorReading[]> {
  const response = await fetch(
    `${API_URL}/api/helmets/${helmetId}/readings`,
  );

  if (!response.ok) {
    throw new Error(`History request failed (${response.status})`);
  }

  const result: unknown = await response.json();

  // Support endpoints returning either an array or { readings: [...] }.
  if (Array.isArray(result)) {
    return result as SensorReading[];
  }

  if (
    result &&
    typeof result === "object" &&
    "readings" in result &&
    Array.isArray((result as { readings: unknown }).readings)
  ) {
    return (result as { readings: SensorReading[] }).readings;
  }

  return [];
}

function HealthPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [helmetData, setHelmetData] = useState<
    Record<string, HelmetLiveState>
  >({});

  const selectedHelmet = 
    HEALTH_HELMET_IDS[activeIndex]  ?? HEALTH_HELMET_IDS[0];
  const activeState = helmetData[selectedHelmet];
  const liveData = activeState?.data ?? null;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex(
        (index) => (index + 1) % HEALTH_HELMET_IDS.length,
      );
    }, CAROUSEL_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshAllHelmets = async () => {
      const results = await Promise.all(
        HEALTH_HELMET_IDS.map(async (helmetId) => {
          const [latestResult, historyResult] =
            await Promise.allSettled([
              fetchLatest(helmetId),
              fetchReadings(helmetId),
            ]);

          return {
            helmetId,
            latestResult,
            historyResult,
          };
        }),
      );

      if (cancelled) return;

      setHelmetData((previous) => {
        const next = { ...previous };

        for (const result of results) {
          const previousState = previous[result.helmetId];

          next[result.helmetId] = {
            data:
              result.latestResult.status === "fulfilled"
                ? result.latestResult.value
                : null,
            readings:
              result.historyResult.status === "fulfilled"
                ? result.historyResult.value
                : [],
            error:
              result.latestResult.status === "rejected"
                ? result.latestResult.reason instanceof Error
                  ? result.latestResult.reason.message
                  : "Unable to load latest sensor data."
                : null,
            historyError:
              result.historyResult.status === "rejected"
                ? result.historyResult.reason instanceof Error
                  ? result.historyResult.reason.message
                  : "Unable to load sensor history."
                : null,
            loading: false,
          };

            
        }

        return next;
      });
    };

    void refreshAllHelmets();

    const timer = window.setInterval(
      () => void refreshAllHelmets(),
      REFRESH_INTERVAL,
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const tally = (overall: Overall) =>
    helmets.filter((helmet) => overallHealth(helmet) === overall).length;

  const visibleHelmets = helmets.filter((helmet) =>
    HEALTH_HELMET_IDS.includes(
      helmet.id as (typeof HEALTH_HELMET_IDS)[number],
    ),
  );

  return (
    <>
      <PageTitle
        title="Helmet Health"
        sub="Hardware diagnostics for every smart helmet"
      />

      {/* Overall section intentionally preserved */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard
          label="Total Helmets"
          value={helmets.length}
          tone="info"
        />
        <StatCard label="Healthy" value={tally("Healthy")} />
        <StatCard
          label="Warning"
          value={tally("Warning")}
          tone="warn"
        />
        <StatCard
          label="Critical"
          value={tally("Critical")}
          tone="crit"
        />
        <StatCard
          label="Offline"
          value={tally("Offline")}
          tone="off"
        />
      </div>

      {/* Live sensor carousel */}
      <section className="glass mt-5 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Live Sensor Readings
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Helmet {selectedHelmet} · Automatically switches every 5 seconds
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="health-helmet-selector" className="text-xs text-muted-foreground">
              Select helmet
            </label>
            <select
              id="health-helmet-selector"
              value={selectedHelmet}
              onChange={(event) => {
                const index = HEALTH_HELMET_IDS.indexOf(
                  event.target.value as (typeof HEALTH_HELMET_IDS)[number],
                );
                if (index >= 0) setActiveIndex(index);
              }}
              className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {HEALTH_HELMET_IDS.map((helmetId) => (
                <option key={helmetId} value={helmetId}>
                  {helmetId}
                </option>
              ))}
            </select>

            <button
              type="button"
              aria-label="Previous helmet"
              onClick={() =>
                setActiveIndex(
                  (activeIndex - 1 + HEALTH_HELMET_IDS.length) %
                    HEALTH_HELMET_IDS.length,
                )
              }
              className="rounded border border-border p-2 hover:bg-accent"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-16 text-center font-mono text-sm">
              {activeIndex + 1} / {HEALTH_HELMET_IDS.length}
            </span>

            <button
              type="button"
              aria-label="Next helmet"
              onClick={() =>
                setActiveIndex(
                  (activeIndex + 1) % HEALTH_HELMET_IDS.length,
                )
              }
              className="rounded border border-border p-2 hover:bg-accent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {HEALTH_HELMET_IDS.map((helmetId, index) => (
            <button
              key={helmetId}
              type="button"
              aria-label={`Show helmet ${helmetId}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index === activeIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-card p-3">
          <div>
            <p className="label-caps">Selected Helmet</p>
            <h3 className="mt-1 font-mono text-xl font-semibold">
              {selectedHelmet}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Miner: {liveData?.miner_name ?? "--"}
              {" · "}
              Zone: {liveData?.zone ?? "--"}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 rounded border px-3 py-2 text-sm ${
              isOnline(liveData)
                ? "border-ok/40 text-ok"
                : "border-off/40 text-off"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                isOnline(liveData) ? "bg-ok" : "bg-off"
              }`}
            />
            {activeState?.loading
              ? "CHECKING..."
              : isOnline(liveData)
                ? "ONLINE"
                : "OFFLINE"}
          </div>
        </div>

        {activeState?.error && (
          <p role="alert" className="mt-3 text-sm text-crit">
            Could not load {selectedHelmet}: {activeState.error}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <LiveMetric
            label="Temperature"
            value={formatValue(liveData?.temperature)}
            unit={liveData?.temperature == null ? "" : "°C"}
          />
          <LiveMetric
            label="Humidity"
            value={formatValue(liveData?.humidity)}
            unit={liveData?.humidity == null ? "" : "%"}
          />
          <LiveMetric
            label="MQ4"
            value={formatValue(liveData?.mq4, 2)}
          />
          <LiveMetric
            label="MQ135"
            value={formatValue(liveData?.mq135, 2)}
          />
          <LiveMetric
            label="MQ2"
            value={formatValue(liveData?.mq2, 2)}
          />
          <LiveMetric
            label="Battery"
            value={formatValue(liveData?.battery, 0)}
            unit={liveData?.battery == null ? "" : "%"}
          />
          <LiveMetric
            label="Impact"
            value={
              liveData?.impact == null
                ? "--"
                : liveData.impact
                  ? "DETECTED"
                  : "NORMAL"
            }
          />
          <LiveMetric
            label="ESP Status"
            value={
              liveData == null
                ? "OFFLINE"
                : isOnline(liveData)
                  ? "ONLINE"
                  : "OFFLINE"
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            Last sensor reading: {formatTimestamp(liveData?.timestamp)}
          </span>
          <span>Data refreshes every 3 seconds</span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Gas readings are raw sensor values, not calibrated gas concentrations.
          Missing values are not replaced with mock readings.
        </p>
      </section>

      {/* Only H001, H002 and H003 are listed here */}
      <div className="glass mt-5 overflow-x-auto rounded-lg">
        <table className="w-full min-w-262.5 text-sm">
          <thead>
            <tr>
              {["Helmet ID", ...cols, "Battery", "Overall"].map(
                (heading, index) => (
                  <th
                    key={heading}
                    className={`label-caps border-b px-3 py-3 font-normal ${
                      index === 0 ? "text-left" : "text-center"
                    }`}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {visibleHelmets.map((helmet) => {
              const id = helmet.id;
              const state = helmetData[id];
              const data = state?.data ?? null;
              const isOpen = open === id;
              const overall = overallHealth(helmet);
              const battery = data?.battery;
              const online = isOnline(data);

              return (
                <Fragment key={id}>
                  <tr
                    onClick={() =>
                      setOpen(isOpen ? null : id)
                    }
                    className={`cursor-pointer border-t transition-colors hover:bg-accent/40 ${
                      isOpen ? "bg-accent/40" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2 font-mono text-primary">
                        <ChevronDown
                          className={`size-4 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                        {id}
                        {data && (
                          <span className="text-[10px] text-ok">
                            LIVE
                          </span>
                        )}
                      </span>
                    </td>

                    {cols.map((component) => {
                      const status = getLiveComponentStatus(
                        component,
                        data,
                      );

                      return (
                        <td key={component} className="px-3 py-3 text-center">
                          {status === "Unavailable" ? (
                            <span
                              className="text-xs text-muted-foreground"
                              title="No component status reported by the API"
                            >
                              --
                            </span>
                          ) : (
                            <Mark v={status} />
                          )}
                        </td>
                      );
                    })}

                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {battery == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            {
                              ok: "text-ok",
                              warn: "text-warn",
                              crit: "text-crit",
                              off: "text-off",
                              info: "",
                            }[batteryTone(battery)]
                          }
                        >
                          {battery}%
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <StatusBadge
                        value={online ? "Online" : "Offline"}
                        tone={online ? "ok" : "off"}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={cols.length + 3} className="p-0">
                      <div
                        className={`grid transition-all duration-300 ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          {isOpen && (
                            <Detail
                              id={id}
                              liveData={data}
                              readings={state?.readings ?? []}
                              historyError={state?.historyError ?? null}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function getLiveComponentStatus(
  component: (typeof cols)[number],
  data: LiveHelmetData | null,
): string {
  if (component === "ESP32") {
    return isOnline(data) ? "Normal" : "Offline";
  }

  if (!data) return "Unavailable";

  switch (component) {
    case "MQ4":
      return data.mq4 == null ? "Unavailable" : "Normal";
    case "MQ135":
      return data.mq135 == null ? "Unavailable" : "Normal";
    case "MQ2":
      return data.mq2 == null ? "Unavailable" : "Normal";
    case "DHT22":
      return data.temperature == null && data.humidity == null
        ? "Unavailable"
        : "Normal";
    case "ADXL345":
      return data.accel_x == null &&
        data.accel_y == null &&
        data.accel_z == null
        ? "Unavailable"
        : "Normal";
    case "LoRa":
    case "GPS":
      return "Unavailable";
    default:
      return "Unavailable";
  }
}

function LiveMetric({
  label,
  value,
  unit = "",
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-card p-3">
      <p className="label-caps">{label}</p>
      <p className="mt-2 wrap-break-words font-mono text-xl font-semibold">
        {value}
        {unit && (
          <span className="ml-1 text-xs text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

function Detail({
  id,
  liveData,
  readings,
  historyError,
}: {
  id: string;
  liveData: LiveHelmetData | null;
  readings: SensorReading[];
  historyError: string | null;
}) {
  const helmet = helmets.find((item) => item.id === id);

  if (!helmet) return null;

  const overall = overallHealth(helmet);

  const history = [...readings]
    .filter((reading) => Boolean(reading.timestamp))
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    );

  const temperatureHistory = history
    .filter((reading) => reading.temperature != null)
    .map((reading) => ({
      time: formatTimeAxis(reading.timestamp),
      temperature: reading.temperature as number,
    }));

  const humidityHistory = history
    .filter((reading) => reading.humidity != null)
    .map((reading) => ({
      time: formatTimeAxis(reading.timestamp),
      humidity: reading.humidity as number,
    }));

  const batteryHistory = history
    .filter((reading) => reading.battery != null)
    .map((reading) => ({
      time: formatTimeAxis(reading.timestamp),
      battery: reading.battery as number,
    }));

  const accelXHistory = history
    .filter((reading) => reading.accel_x != null)
    .map((reading) => ({
      time: formatTimeAxis(reading.timestamp),
      value: reading.accel_x as number,
    }));

  const accelYHistory = history
    .filter((reading) => reading.accel_y != null)
    .map((reading) => ({
      time: formatTimeAxis(reading.timestamp),
      value: reading.accel_y as number,
    }));

  const accelZHistory = history
    .filter((reading) => reading.accel_z != null)
    .map((reading) => ({
      time: formatTimeAxis(reading.timestamp),
      value: reading.accel_z as number,
    }));

  const latestReadingTime =
    liveData?.timestamp ?? liveData?.last_seen ?? null;

  return (
    <div className="space-y-4 border-t bg-surface/70 p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border bg-card p-4">
          <h3 className="font-display text-lg font-semibold uppercase tracking-wide">
            Helmet {id}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="label-caps">ESP32 Connectivity</span>
            <StatusBadge
              value={isOnline(liveData) ? "Online" : "Offline"}
              tone={isOnline(liveData) ? "ok" : "off"}
            />
          </div>

          <dl className="mt-3 space-y-2 font-mono text-xs">
            <DetailRow
              label="Temperature"
              value={
                liveData?.temperature == null
                  ? "--"
                  : `${formatValue(liveData.temperature)} °C`
              }
            />
            <DetailRow
              label="Humidity"
              value={
                liveData?.humidity == null
                  ? "--"
                  : `${formatValue(liveData.humidity)}%`
              }
            />
            <DetailRow
              label="MQ4"
              value={formatValue(liveData?.mq4, 2)}
            />
            <DetailRow
              label="MQ135"
              value={formatValue(liveData?.mq135, 2)}
            />
            <DetailRow
              label="MQ2"
              value={formatValue(liveData?.mq2, 2)}
            />
            <DetailRow
              label="Battery"
              value={
                liveData?.battery == null
                  ? "--"
                  : `${liveData.battery}%`
              }
            />
            <DetailRow
              label="Impact"
              value={
                liveData?.impact == null
                  ? "--"
                  : liveData.impact
                    ? "Detected"
                    : "Normal"
              }
            />
            <DetailRow
              label="Last reading"
              value={formatTimestamp(latestReadingTime)}
            />
          </dl>

          <div className="mt-4 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="label-caps">Overall Health</span>
              <StatusBadge
                value={overall}
                tone={overallTone[overall]}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              The Overall summary above retains its existing dashboard
              calculation. Component availability here comes from the live API.
            </p>
          </div>
        </section>

        <section className="rounded-md border bg-card p-4">
          <h3 className="label-caps mb-2">Live History Summary</h3>

          <dl className="space-y-2 font-mono text-xs">
            <DetailRow
              label="History records"
              value={String(history.length)}
            />
            <DetailRow
              label="First record"
              value={formatTimestamp(history[0]?.timestamp)}
            />
            <DetailRow
              label="Latest record"
              value={formatTimestamp(
                history[history.length - 1]?.timestamp,
              )}
            />
            <DetailRow
              label="ADXL345 X"
              value={formatValue(liveData?.accel_x, 3)}
            />
            <DetailRow
              label="ADXL345 Y"
              value={formatValue(liveData?.accel_y, 3)}
            />
            <DetailRow
              label="ADXL345 Z"
              value={formatValue(liveData?.accel_z, 3)}
            />
          </dl>

          {historyError && (
            <p role="alert" className="mt-3 text-sm text-crit">
              Could not load history: {historyError}
            </p>
          )}

          {!historyError && history.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              No historical readings are currently available for this helmet.
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HistoryChart
          title="Temperature History (°C)"
          data={temperatureHistory}
          x="time"
          series={[
            {
              key: "temperature",
              color: "var(--chart-1)",
            },
          ]}
        />

        <HistoryChart
          title="Humidity History (%)"
          data={humidityHistory}
          x="time"
          series={[
            {
              key: "humidity",
              color: "var(--chart-2)",
            },
          ]}
        />

        <HistoryChart
          title="Battery History (%)"
          data={batteryHistory}
          x="time"
          series={[
            {
              key: "battery",
              color: "var(--chart-3)",
            },
          ]}
        />

        <section className="rounded-md border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h3 className="label-caps">ADXL345 Acceleration History</h3>
          </div>

          <div className="grid gap-4">
            <HistoryChart
              title="X Axis"
              data={accelXHistory}
              x="time"
              series={[
                {
                  key: "value",
                  color: "var(--chart-1)",
                },
              ]}
              height={130}
            />
            <HistoryChart
              title="Y Axis"
              data={accelYHistory}
              x="time"
              series={[
                {
                  key: "value",
                  color: "var(--chart-2)",
                },
              ]}
              height={130}
            />
            <HistoryChart
              title="Z Axis"
              data={accelZHistory}
              x="time"
              series={[
                {
                  key: "value",
                  color: "var(--chart-4)",
                },
              ]}
              height={130}
            />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Acceleration graphs use the API's accel_x, accel_y and accel_z
            fields. Confirm the firmware sensor mapping before treating these
            values as verified ADXL345 measurements.
          </p>
        </section>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="wrap-break-words text-right">{value}</dd>
    </div>
  );
}

function HistoryChart({
  title,
  data,
  x,
  series,
  height = 170,
}: {
  title: string;
  data: Record<string, string | number | null>[];
  x: string;
  series: { key: string; color: string }[];
  height?: number;
}) {
  return (
    <section className="min-w-0 rounded-md border bg-card p-4">
      <h3 className="label-caps mb-2">{title}</h3>

      {data.length === 0 ? (
        <div
          className="flex items-center justify-center text-xs text-muted-foreground"
          style={{ height }}
        >
          No history data available
        </div>
      ) : (
        <TrendArea
          data={data}
          x={x}
          series={series}
          h={height}
        />
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        {data.length} recorded point{data.length === 1 ? "" : "s"}
      </p>
    </section>
  );
}
