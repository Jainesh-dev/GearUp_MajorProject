import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BatteryMedium, Flame, MapPin, Radio, Thermometer, Droplets, Wind, Zap } from "lucide-react";
import { helmets, helmetEvents, helmetHistory } from "@/data/mockData";
import { Panel, SensorCard, StatusBadge, batteryTone, toneOf, Dot } from "@/components/kit";
import { TrendArea } from "@/components/Charts";

export const Route = createFileRoute("/miners/$id")({
  loader: ({ params }) => {
    const helmet = helmets.find((h) => h.id === params.id);
    if (!helmet) throw notFound();
    return { helmet };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.helmet.id} · ${loaderData.helmet.miner} — GearUp` },
          { name: "description", content: `Sensor readings and history for helmet ${loaderData.helmet.id}.` },
          { property: "og:title", content: `${loaderData.helmet.id} · ${loaderData.helmet.miner} — GearUp` },
          { property: "og:description", content: `Sensor readings and history for helmet ${loaderData.helmet.id}.` },
        ]
      : [{ title: "Helmet not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <p className="p-8 text-muted-foreground">Helmet not found. <Link to="/miners" className="text-primary">Back to miners</Link></p>,
  component: HelmetPage,
});

function HelmetPage() {
  const { helmet: h } = Route.useLoaderData();
  const hist = helmetHistory(h.id);
  const ev = helmetEvents(h.id);
  const off = h.status === "Offline";
  const lvl: Record<string, "ok" | "info" | "warn" | "crit"> = { ok: "ok", info: "info", warn: "warn", crit: "crit" };
  return (
    <>
      <Link to="/miners" className="mb-4 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="size-3" /> All miners</Link>
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-md border bg-card p-5">
        <div className="grid size-14 place-items-center rounded-sm bg-primary font-mono text-lg font-semibold text-primary-foreground">{h.id}</div>
        <div>
          <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">{h.miner}</h1>
          <p className="font-mono text-xs text-muted-foreground">Helmet {h.id} · {h.zone} · Updated {h.lastUpdated}</p>
        </div>
        <div className="ml-auto"><StatusBadge value={h.status} tone={toneOf(h.status === "Online" ? "Normal" : h.status)} /></div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SensorCard label="Temperature" value={off ? "—" : h.temperature} unit="°C" tone={off ? "off" : h.temperature > 36 ? "warn" : "ok"} icon={<Thermometer className="size-4" />} />
        <SensorCard label="Humidity" value={off ? "—" : h.humidity} unit="%" tone={off ? "off" : "ok"} icon={<Droplets className="size-4" />} />
        <SensorCard label="Methane" value={off ? "—" : h.methane} tone={off ? "off" : toneOf(h.methane)} icon={<Flame className="size-4" />} sub={off ? undefined : `${h.methanePpm} ppm`} />
        <SensorCard label="Air Quality" value={off ? "—" : h.airQuality} tone={off ? "off" : toneOf(h.airQuality)} icon={<Wind className="size-4" />} sub={off ? undefined : `AQI ${h.aqi}`} />
        <SensorCard label="Impact" value={h.impact} tone={off ? "off" : toneOf(h.impact)} icon={<Zap className="size-4" />} />
        <SensorCard label="Battery" value={h.battery} unit="%" tone={batteryTone(h.battery)} icon={<BatteryMedium className="size-4" />} />
        <SensorCard label="LoRa Status" value={h.lora} tone={toneOf(h.lora)} icon={<Radio className="size-4" />} />
        <SensorCard label="GPS Status" value={h.gps} tone={toneOf(h.gps)} icon={<MapPin className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Temperature history (°C)"><TrendArea data={hist} x="time" series={[{ key: "temperature", color: "var(--chart-1)" }]} /></Panel>
        <Panel title="Humidity history (%)"><TrendArea data={hist} x="time" series={[{ key: "humidity", color: "var(--chart-2)" }]} /></Panel>
        <Panel title="Methane history (ppm)"><TrendArea data={hist} x="time" series={[{ key: "methane", color: "var(--chart-4)" }]} /></Panel>
        <Panel title="Air quality history (AQI)"><TrendArea data={hist} x="time" series={[{ key: "aqi", color: "var(--chart-3)" }]} /></Panel>
      </div>

      <Panel title="Event Timeline" className="mt-4">
        <ol className="relative ml-2 border-l">
          {ev.map((e, i) => (
            <li key={i} className="mb-4 ml-5 last:mb-0">
              <span className="absolute -left-[5px] mt-1.5"><Dot tone={lvl[e.level] ?? "info"} pulse={e.level === "crit"} /></span>
              <p className="font-mono text-xs text-muted-foreground">{e.time}</p>
              <p className="text-sm">{e.text}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
