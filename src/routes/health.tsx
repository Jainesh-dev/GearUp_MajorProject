import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { Check, ChevronDown, Minus, TriangleAlert, X } from "lucide-react";
import { batteryTrend, connectionHistory, components, helmetHealth, helmets, minerDetail, overallHealth, type Overall } from "@/data/mockData";
import { Dot, PageTitle, StatCard, StatusBadge, batteryTone, toneOf, type Tone } from "@/components/kit";
import { TrendArea } from "@/components/Charts";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Helmet Health — GearUp" },
      { name: "description", content: "Technical health of every smart helmet: ESP32, gas sensors, LoRa, GPS and battery." },
      { property: "og:title", content: "Helmet Health — GearUp" },
      { property: "og:description", content: "Technical health of every smart helmet: ESP32, gas sensors, LoRa, GPS and battery." },
    ],
  }),
  component: HealthPage,
});

const overallTone: Record<Overall, Tone> = { Healthy: "ok", Warning: "warn", Critical: "crit", Offline: "off" };
const cols = ["ESP32", "MQ4", "MQ135", "MQ2", "DHT22", "MPU6050", "LoRa", "GPS"] as const;

function Mark({ v }: { v: string }) {
  const t = toneOf(v);
  if (t === "ok") return <Check className="mx-auto size-4 text-ok" />;
  if (t === "warn") return <TriangleAlert className="mx-auto size-4 text-warn" />;
  if (t === "off") return <Minus className="mx-auto size-4 text-off" />;
  return <X className="mx-auto size-4 text-crit" />;
}

function HealthPage() {
  const [open, setOpen] = useState<string | null>(null);
  const tally = (o: Overall) => helmets.filter((h) => overallHealth(h) === o).length;
  return (
    <>
      <PageTitle title="Helmet Health" sub="Hardware diagnostics for every smart helmet" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total Helmets" value={helmets.length} tone="info" />
        <StatCard label="Healthy" value={tally("Healthy")} />
        <StatCard label="Warning" value={tally("Warning")} tone="warn" />
        <StatCard label="Critical" value={tally("Critical")} tone="crit" />
        <StatCard label="Offline" value={tally("Offline")} tone="off" />
      </div>
      <div className="glass mt-5 overflow-x-auto rounded-lg">
        <table className="w-full min-w-[980px] text-sm">
          <thead><tr>{["Helmet ID", ...cols, "Battery", "Overall"].map((h, i) => <th key={h} className={`label-caps border-b px-3 py-3 font-normal ${i === 0 ? "text-left" : "text-center"}`}>{h}</th>)}</tr></thead>
          <tbody>
            {helmets.map((h) => {
              const hh = helmetHealth(h);
              const o = overallHealth(h);
              const isOpen = open === h.id;
              return (
                <Fragment key={h.id}>
                  <tr onClick={() => setOpen(isOpen ? null : h.id)} className={`cursor-pointer border-t transition-colors hover:bg-accent/40 ${isOpen ? "bg-accent/40" : ""}`}>
                    <td className="px-3 py-3"><span className="flex items-center gap-2 font-mono text-primary"><ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />{h.id}</span></td>
                    {cols.map((c) => <td key={c} className="px-3 py-3"><Mark v={hh[c]} /></td>)}
                    <td className="px-3 py-3 text-center font-mono text-xs"><span className={{ ok: "text-ok", warn: "text-warn", crit: "text-crit", off: "text-off", info: "" }[batteryTone(h.battery)]}>{h.battery}%</span></td>
                    <td className="px-3 py-3 text-center"><StatusBadge value={o} tone={overallTone[o]} /></td>
                  </tr>
                  <tr><td colSpan={cols.length + 3} className="p-0">
                    <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">{isOpen && <Detail id={h.id} />}</div>
                    </div>
                  </td></tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Detail({ id }: { id: string }) {
  const h = helmets.find((x) => x.id === id)!;
  const hh = helmetHealth(h);
  const d = minerDetail(h);
  const o = overallHealth(h);
  return (
    <div className="grid gap-4 border-t bg-surface/70 p-5 lg:grid-cols-3">
      <div className="rounded-md border bg-card p-4">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide">Helmet {h.id}</h3>
        <ul className="mt-2">
          {components.map((c) => (
            <li key={c} className="flex justify-between border-b border-dashed border-border/70 py-1.5 font-mono text-xs last:border-0">
              <span className="text-muted-foreground">{c}</span>
              <span className="flex items-center gap-1.5 uppercase"><Dot tone={c === "Battery" ? batteryTone(h.battery) : toneOf(hh[c])} />{hh[c]}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between"><span className="label-caps">Overall Health</span><StatusBadge value={o} tone={overallTone[o]} /></div>
      </div>
      <div className="rounded-md border bg-card p-4">
        <h3 className="label-caps mb-2">Battery Trend</h3>
        <TrendArea data={batteryTrend(h)} x="time" series={[{ key: "battery", color: "var(--chart-3)" }]} h={170} />
      </div>
      <div className="rounded-md border bg-card p-4">
        <h3 className="label-caps mb-2">Health History</h3>
        <dl className="space-y-1.5 font-mono text-xs">
          <div className="flex justify-between"><dt className="text-muted-foreground">Last maintenance</dt><dd>{d.maintenance}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Last transmission</dt><dd>{h.lastUpdated}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Sensor status</dt><dd>{o === "Healthy" ? "All nominal (24h)" : "Fault logged today"}</dd></div>
        </dl>
        <h3 className="label-caps mb-2 mt-4">Connection History</h3>
        <ol className="space-y-1">
          {connectionHistory(h).map((c, i) => <li key={i} className="flex gap-3 font-mono text-xs"><span className="w-16 text-muted-foreground">{c.time}</span>{c.text}</li>)}
        </ol>
      </div>
    </div>
  );
}
