import { Link } from "@tanstack/react-router";
import { helmets } from "@/data/mockData";
import { toneOf } from "./kit";

const zones = [
  { name: "Zone A", x: 6, y: 18, w: 28, h: 34 },
  { name: "Zone B", x: 38, y: 16, w: 24, h: 34 },
  { name: "Zone C", x: 66, y: 22, w: 28, h: 34 },
  { name: "Zone D", x: 20, y: 62, w: 30, h: 28 },
  { name: "Zone E", x: 60, y: 62, w: 30, h: 28 },
];
const fill = { ok: "var(--ok)", warn: "var(--warn)", crit: "var(--crit)", off: "var(--off)", info: "var(--info)" };

export function MineMap({ compact }: { compact?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden rounded-md border bg-surface grid-bg">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={compact ? "h-72 w-full" : "h-[520px] w-full"}>
        {/* tunnels */}
        <g stroke="var(--muted)" strokeWidth="3.2" fill="none" strokeLinecap="round">
          <path d="M2 8 H98" /><path d="M50 8 V96" /><path d="M20 35 H80" /><path d="M35 76 H75" /><path d="M20 8 V35" /><path d="M80 8 V40" />
        </g>
        <g stroke="var(--border)" strokeWidth="0.3" strokeDasharray="1 1" fill="none">
          <path d="M2 8 H98" /><path d="M50 8 V96" /><path d="M20 35 H80" /><path d="M35 76 H75" />
        </g>
        {zones.map((z) => (
          <g key={z.name}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="var(--primary)" fillOpacity="0.04" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="0.25" strokeDasharray="1.2 0.8" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      {/* labels as HTML so they don't stretch */}
      {zones.map((z) => (
        <span key={z.name} className="label-caps absolute !text-primary/80" style={{ left: `${z.x + 1}%`, top: `${z.y + 1}%` }}>{z.name}</span>
      ))}
      <span className="absolute left-1 top-[4%] rounded-sm bg-ok/20 px-1.5 py-0.5 font-mono text-[10px] text-ok">▶ ENTRY</span>
      <span className="absolute right-1 top-[4%] rounded-sm bg-crit/20 px-1.5 py-0.5 font-mono text-[10px] text-crit">EXIT ▶</span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-sm bg-warn/20 px-1.5 py-0.5 font-mono text-[10px] text-warn">EMERGENCY EXIT</span>
      {helmets.map((h) => {
        const t = toneOf(h.status === "Online" ? "Normal" : h.status);
        return (
          <Link key={h.id} to="/miners/$id" params={{ id: h.id }} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${h.map.x}%`, top: `${h.map.y}%` }}>
            <span className={`block size-3.5 rounded-full border-2 border-background ${t === "crit" ? "pulse-dot" : ""}`} style={{ background: fill[t], color: fill[t] }} />
            {!compact && <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] text-muted-foreground">{h.id}</span>}
            <span className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-sm border bg-popover px-2 py-1 text-xs shadow-lg group-hover:block">
              <b className="font-mono">{h.id}</b> · {h.miner}<br /><span style={{ color: fill[t] }}>{h.status}</span>
            </span>
          </Link>
        );
      })}
      <div className="absolute bottom-2 right-2 flex gap-3 rounded-sm border bg-popover/90 px-2 py-1 font-mono text-[10px]">
        {(["ok", "warn", "crit", "off"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: fill[k] }} />{{ ok: "Normal", warn: "Warning", crit: "Critical", off: "Offline" }[k]}</span>
        ))}
      </div>
    </div>
  );
}
