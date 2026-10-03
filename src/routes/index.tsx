import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Flame, HardHat, Thermometer, Users, Wind } from "lucide-react";
import { alerts, helmets, summary, analytics } from "@/data/mockData";
import { PageTitle, Panel, StatCard, StatusBadge } from "@/components/kit";
import { MinerTable } from "@/components/MinerTable";
import { MineMap } from "@/components/MineMap";
import { TrendArea } from "@/components/Charts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — GearUp Smart Mining Helmet" },
      { name: "description", content: "Live overview of miners, helmets, gas levels and alerts across the mine." },
      { property: "og:title", content: "Dashboard — GearUp Smart Mining Helmet" },
      { property: "og:description", content: "Live overview of miners, helmets, gas levels and alerts across the mine." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const active = alerts.filter((a) => a.category === "Critical" && a.status === "Active");
  const env = analytics("24h").env.slice(-12);
  return (
    <>
      <PageTitle title="Dashboard" sub="Shift B · Underground Level 2 · Demo data" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active Miners" value={summary.activeMiners} icon={<Users className="size-4" />} note="All checked in" />
        <StatCard label="Active Helmets" value={summary.activeHelmets} icon={<HardHat className="size-4" />} note="Transmitting" />
        <StatCard label="Avg Temperature" value={summary.avgTemperature} unit="°C" icon={<Thermometer className="size-4" />} tone="ok" note="Within range" />
        <StatCard label="Methane Level" value={summary.methane} icon={<Flame className="size-4" />} note="Mine average" />
        <StatCard label="Air Quality" value={summary.airQuality} icon={<Wind className="size-4" />} note="AQI 48" />
        <StatCard label="Active Alerts" value={summary.activeAlerts} icon={<AlertTriangle className="size-4" />} tone="crit" note="Needs attention" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Mine Overview (Mock Map)" className="xl:col-span-2" action={<Link to="/map" className="font-mono text-xs text-primary">Open map →</Link>}>
          <MineMap compact />
        </Panel>
        <Panel title="Critical Alerts" action={<Link to="/alerts" className="font-mono text-xs text-primary">All alerts →</Link>}>
          <ul className="space-y-2">
            {active.map((a) => (
              <li key={a.id} className="rounded-sm border border-crit/40 bg-crit/5 p-3">
                <div className="flex items-center justify-between gap-2"><span className="font-medium">{a.type}</span><StatusBadge value="Critical" /></div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{a.helmetId} · {a.miner} · {a.zone} · {a.time}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="label-caps mb-2">Avg temperature · last 12h</p>
            <TrendArea data={env} x="t" series={[{ key: "temperature", color: "var(--chart-1)" }]} h={120} />
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between"><h2 className="label-caps">Helmet Feed</h2><Link to="/miners" className="font-mono text-xs text-primary">All miners →</Link></div>
        <MinerTable rows={helmets.slice(0, 6)} />
      </div>
    </>
  );
}
