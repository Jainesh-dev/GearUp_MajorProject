import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { Check, ChevronDown, Search, TriangleAlert, X } from "lucide-react";
import { gearLabels, helmets, minerDetail, type GearKey, type Helmet } from "@/data/mockData";
import { Dot, PageTitle, StatusBadge, batteryTone, toneOf, type Tone } from "@/components/kit";

export const Route = createFileRoute("/miners")({
  head: () => ({
    meta: [
      { title: "Miners — GearUp" },
      { name: "description", content: "Monitor each miner, their smart helmet and safety gear status." },
      { property: "og:title", content: "Miners — GearUp" },
      { property: "og:description", content: "Monitor each miner, their smart helmet and safety gear status." },
    ],
  }),
  component: MinersLayout,
});

function MinersLayout() {
  const child = useMatch({ from: "/miners/$id", shouldThrow: false });
  if (child) return <Outlet />;
  return <MinersPage />;
}

const filters = ["All", "Online", "Offline", "Warning", "Critical", "Safety Gear Missing"] as const;
const statusTone = (h: Helmet): Tone => (h.status === "Online" ? "ok" : toneOf(h.status));
const gearTone = { complete: "ok", missing: "warn", critical: "crit" } as const;

function MinersPage() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const rows = helmets.filter((h) => {
    if (!`${h.id} ${h.miner}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (f === "All") return true;
    if (f === "Safety Gear Missing") return minerDetail(h).gearSummary.level !== "complete";
    return h.status === f;
  });
  return (
    <>
      <PageTitle title="Miners" sub="Miner, helmet and safety-equipment monitoring" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border bg-card px-3"><Search className="size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search miner name or helmet ID" className="w-60 bg-transparent py-2 text-sm outline-none" /></div>
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`rounded-md border px-3 py-2 font-mono text-xs transition-colors ${f === x ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{x}</button>
        ))}
      </div>
      <div className="glass overflow-x-auto rounded-lg">
        <table className="w-full min-w-[860px] text-sm">
          <thead><tr className="text-left">{["Miner", "Helmet ID", "Temperature", "Zone", "Safety Gear", "Status", "Last Update"].map((h) => <th key={h} className="label-caps border-b px-4 py-3 font-normal">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((h) => {
              const d = minerDetail(h);
              const isOpen = open === h.id;
              const GIcon = d.gearSummary.level === "complete" ? Check : d.gearSummary.level === "missing" ? TriangleAlert : X;
              return (
                <Fragment key={h.id}>
                  <tr className={`border-t transition-colors hover:bg-accent/40 ${isOpen ? "bg-accent/40" : ""}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => setOpen(isOpen ? null : h.id)} className="flex items-center gap-2 font-medium hover:text-primary">
                        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />{h.miner}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-primary">{h.id}</td>
                    <td className="px-4 py-3 font-mono">{h.status === "Offline" ? "—" : `${h.temperature}°C`}</td>
                    <td className="px-4 py-3 text-muted-foreground">{h.zone}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 font-mono text-xs ${{ ok: "text-ok", warn: "text-warn", crit: "text-crit" }[gearTone[d.gearSummary.level]]}`}><GIcon className="size-3.5" />{d.gearSummary.label}</span></td>
                    <td className="px-4 py-3"><StatusBadge value={h.status} tone={statusTone(h)} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{h.lastUpdated}</td>
                  </tr>
                  <tr><td colSpan={7} className="p-0">
                    <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">{isOpen && <Expanded h={h} />}</div>
                    </div>
                  </td></tr>
                </Fragment>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No miners match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: Tone | undefined }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-border/70 py-1.5 font-mono text-xs last:border-0">
      <span className="uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="flex items-center gap-1.5 uppercase">{tone && <Dot tone={tone} />}{v}</span>
    </div>
  );
}

function Expanded({ h }: { h: Helmet }) {
  const d = minerDetail(h);
  const off = h.status === "Offline";
  return (
    <div className="grid gap-4 border-t bg-surface/70 p-5 lg:grid-cols-4">
      <div className="rounded-md border bg-card p-4">
        <h3 className="label-caps mb-2">Miner Profile</h3>
        <Row k="Name" v={h.miner} /><Row k="Helmet ID" v={h.id} /><Row k="Zone" v={h.zone} />
        <Row k="Status" v={h.status} tone={statusTone(h)} /><Row k="Last Update" v={h.lastUpdated} />
        <h3 className="label-caps mb-2 mt-4">Miner Location</h3>
        <Row k="Current Zone" v={h.zone} /><Row k="Network" v={d.network.meshNode} />
        <Row k="Connection" v={d.network.connection} tone={d.network.connection === "Stable" ? "ok" : d.network.connection === "Weak" ? "warn" : "crit"} />
      </div>
      <div className="rounded-md border bg-card p-4 lg:col-span-2">
        <h3 className="label-caps mb-3">Safety Gear</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.keys(gearLabels) as GearKey[]).map((k) => {
            const ok = d.safetyGear[k];
            return (
              <div key={k} className={`rounded-md border p-3 ${ok ? "border-ok/30 bg-ok/5" : "border-warn/50 bg-warn/10"}`}>
                <p className="label-caps">{gearLabels[k]}</p>
                <p className={`mt-1 flex items-center gap-1.5 font-mono text-xs uppercase ${ok ? "text-ok" : "text-warn"}`}>
                  {ok ? <Check className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
                  {ok ? (k === "helmet" ? "Connected" : "Present") : "Not detected"}
                </p>
              </div>
            );
          })}
        </div>
        <h3 className="label-caps mb-2 mt-4">Gear Activity</h3>
        <ol className="space-y-1">
          {d.gearActivity.map((g, i) => (
            <li key={i} className="flex gap-3 font-mono text-xs"><span className="w-16 text-muted-foreground">{g.time}</span><span className={g.text.includes("not") ? "text-warn" : ""}>{g.text}</span></li>
          ))}
        </ol>
      </div>
      <div className="rounded-md border bg-card p-4">
        <h3 className="label-caps mb-2">Helmet Status</h3>
        <Row k="Helmet" v={h.status} tone={statusTone(h)} />
        <Row k="Battery" v={`${h.battery}%`} tone={batteryTone(h.battery)} />
        <Row k="Temperature" v={off ? "—" : `${h.temperature}°C`} />
        <Row k="Humidity" v={off ? "—" : `${h.humidity}%`} />
        <Row k="Gas" v={off ? "—" : h.methane} tone={off ? "off" : toneOf(h.methane)} />
        <Row k="Impact" v={h.impact} tone={off ? "off" : toneOf(h.impact)} />
        <Row k="LoRa" v={h.lora} tone={toneOf(h.lora)} />
        <Row k="GPS" v={h.gps} tone={toneOf(h.gps)} />
      </div>
      <div className="flex flex-wrap gap-2 lg:col-span-4">
        <Link to="/miners/$id" params={{ id: h.id }} className="rounded-md bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground hover:opacity-90">View Full Details</Link>
        <Link to="/map" className="rounded-md border px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-primary hover:text-primary">View on Map</Link>
        <Link to="/miners/$id" params={{ id: h.id }} hash="activity" className="rounded-md border px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-primary hover:text-primary">View Activity</Link>
      </div>
    </div>
  );
}
