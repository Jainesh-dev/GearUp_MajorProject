import { Link } from "@tanstack/react-router";
import type { Helmet } from "@/data/mockData";
import { StatusBadge, batteryTone, toneOf } from "./kit";

export function MinerTable({ rows }: { rows: Helmet[] }) {
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-surface">
          <tr className="text-left">
            {["Helmet ID", "Miner", "Zone", "Temp", "Humidity", "Methane", "Air Quality", "Battery", "Status", ""].map((h) => (
              <th key={h} className="label-caps px-4 py-2.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => {
            const off = h.status === "Offline";
            return (
              <tr key={h.id} className="border-t transition-colors hover:bg-accent/50">
                <td className="px-4 py-3 font-mono text-primary">{h.id}</td>
                <td className="px-4 py-3 font-medium">{h.miner}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.zone}</td>
                <td className="px-4 py-3 font-mono">{off ? "—" : `${h.temperature}°C`}</td>
                <td className="px-4 py-3 font-mono">{off ? "—" : `${h.humidity}%`}</td>
                <td className="px-4 py-3">{off ? "—" : <StatusBadge value={h.methane} />}</td>
                <td className="px-4 py-3">{off ? "—" : <StatusBadge value={h.airQuality} />}</td>
                <td className="px-4 py-3"><Battery value={h.battery} /></td>
                <td className="px-4 py-3"><StatusBadge value={h.status} tone={toneOf(h.status === "Online" ? "Normal" : h.status)} /></td>
                <td className="px-4 py-3 text-right">
                  <Link to="/miners/$id" params={{ id: h.id }} className="rounded-sm border px-2.5 py-1 text-xs hover:border-primary hover:text-primary">View Details</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Battery({ value }: { value: number }) {
  const t = batteryTone(value);
  const color = { ok: "bg-ok", warn: "bg-warn", crit: "bg-crit", off: "bg-off", info: "bg-info" }[t];
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-14 overflow-hidden rounded-sm bg-muted"><div className={`h-full ${color}`} style={{ width: `${value}%` }} /></div>
      <span className="font-mono text-xs">{value}%</span>
    </div>
  );
}
