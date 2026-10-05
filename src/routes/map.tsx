import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, X } from "lucide-react";
import { gateway, meshLinks, meshNodes, type MeshNode } from "@/data/mockData";
import { PageTitle, StatusBadge } from "@/components/kit";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Mine Map — GearUp Mesh Network" },
      { name: "description", content: "Underground mesh network map with zones, nodes, gateway and helmet connections (mock)." },
      { property: "og:title", content: "Mine Map — GearUp Mesh Network" },
      { property: "og:description", content: "Underground mesh network map with zones, nodes, gateway and helmet connections (mock)." },
    ],
  }),
  component: MapPage,
});

const col = { Online: "var(--ok)", Weak: "var(--warn)", Offline: "var(--crit)" } as const;
const pos = (id: string) => (id === "GATEWAY" ? gateway : meshNodes.find((n) => n.id === id)!);
const linkColor = (a: string, b: string) => {
  const s = [a, b].map((id) => (id === "GATEWAY" ? "Online" : meshNodes.find((n) => n.id === id)!.status));
  return s.includes("Offline") ? col.Offline : s.includes("Weak") ? col.Weak : col.Online;
};

function MapPage() {
  const [sel, setSel] = useState<MeshNode | null>(meshNodes[1] ?? null);
  return (
    <>
      <PageTitle title="Mine Map" sub="Mesh network view · illustrative layout, not real GPS" />
      <div className="glass relative overflow-hidden rounded-lg">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="relative h-[560px] w-full">
          {/* surface */}
          <rect x="0" y="0" width="100" height="6" fill="var(--muted)" opacity="0.6" />
          {/* tunnels */}
          <g stroke="var(--secondary)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M50 6 V46" /><path d="M10 46 H90" /><path d="M18 46 V80 H82 V46" />
          </g>
          {/* zones */}
          {meshNodes.map((n) => (
            <rect key={n.id} x={n.x - 11} y={n.y - 10} width="22" height="20" rx="1.5" fill="var(--primary)" fillOpacity="0.035" stroke="var(--primary)" strokeOpacity="0.25" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
          ))}
          {/* links */}
          {meshLinks.map(([a, b]) => {
            const p = pos(a), q = pos(b);
            return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={linkColor(a, b)} strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="flow-line" opacity="0.85" />;
          })}
        </svg>
        <span className="label-caps absolute left-1/2 top-1 -translate-x-1/2">Surface</span>
        <span className="absolute left-3 top-[44%] rounded-sm bg-ok/15 px-1.5 py-0.5 font-mono text-[10px] text-ok">ENTRY</span>
        <span className="absolute right-3 top-[44%] rounded-sm bg-crit/15 px-1.5 py-0.5 font-mono text-[10px] text-crit">EMERGENCY EXIT</span>

        {/* gateway */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${gateway.x}%`, top: `${gateway.y}%` }}>
          <div className="mx-auto grid size-10 place-items-center rounded-md border-2 border-info bg-card text-info shadow-lg"><Radio className="size-5" /></div>
          <p className="mt-1 font-mono text-[10px] text-info">GATEWAY</p>
        </div>
        {/* nodes */}
        {meshNodes.map((n) => (
          <button key={n.id} onClick={() => setSel(n)} className="group absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
            <span className="label-caps absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap !text-primary/70">{n.zone}</span>
            <span className={`mx-auto grid size-8 place-items-center rounded-full border-2 bg-card transition-transform group-hover:scale-110 ${sel?.id === n.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} style={{ borderColor: col[n.status], color: col[n.status] }}>
              <span className="pulse-dot size-2.5 rounded-full" style={{ background: col[n.status] }} />
            </span>
            <span className="mt-1 block whitespace-nowrap font-mono text-[10px]">{n.id}</span>
            <span className="block font-mono text-[10px] text-muted-foreground">{n.helmets} helmets</span>
            {/* helmet satellites */}
            {Array.from({ length: Math.min(n.helmets, 8) }).map((_, i) => {
              const a = (i / Math.min(n.helmets, 8)) * Math.PI * 2;
              return <span key={i} className="absolute size-1.5 rounded-full bg-primary" style={{ left: `calc(50% + ${Math.cos(a) * 30}px)`, top: `${16 + Math.sin(a) * 26}px`, opacity: n.status === "Offline" ? 0.3 : 0.9 }} />;
            })}
          </button>
        ))}

        {sel && (
          <div className="glass animate-fade-up absolute right-4 top-12 w-60 rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="font-display text-lg font-semibold uppercase tracking-wide">Mesh {sel.id.replace("-", " ")}</span><button onClick={() => setSel(null)} aria-label="Close"><X className="size-4 text-muted-foreground" /></button></div>
            <dl className="mt-3 space-y-2 font-mono text-xs">
              <div className="flex justify-between"><dt className="text-muted-foreground">STATUS</dt><dd><StatusBadge value={sel.status === "Weak" ? "Weak Signal" : sel.status} tone={sel.status === "Online" ? "ok" : sel.status === "Weak" ? "warn" : "crit"} /></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">HELMETS</dt><dd>{sel.helmets}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">SIGNAL</dt><dd>{sel.signal}%</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">ZONE</dt><dd>{sel.zone}</dd></div>
            </dl>
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-popover/90 px-3 py-2 font-mono text-[10px]">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Helmet</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full border-2 border-ok" />Mesh Node</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border-2 border-info" />Gateway</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-ok" />Stable</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-warn" />Weak</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-crit" />Offline</span>
        </div>
      </div>
    </>
  );
}
