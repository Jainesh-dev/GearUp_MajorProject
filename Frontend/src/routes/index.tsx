import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, HardHat, Network, ShieldCheck, Siren, Users, ArrowRight } from "lucide-react";
import { homeAlerts, homeSummary as s, recentActivity, zoneStatus } from "@/data/mockData";
import { Dot, PageTitle, StatusBadge, toneOf, type Tone } from "@/components/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — GearUp Smart Mining Helmet" },
      { name: "description", content: "Mine safety at a glance: active miners, helmets online, alerts, network and SOS status." },
      { property: "og:title", content: "Home — GearUp Smart Mining Helmet" },
      { property: "og:description", content: "Mine safety at a glance: active miners, helmets online, alerts, network and SOS status." },
    ],
  }),
  component: Home,
});

const toneText: Record<Tone, string> = { ok: "text-ok", warn: "text-warn", crit: "text-crit", off: "text-off", info: "text-info" };

function Card({ label, value, sub, tone, icon, i }: { label: string; value: string; sub: string; tone: Tone; icon: React.ReactNode; i: number }) {
  return (
    <div className="glass animate-fade-up rounded-lg p-5" style={{ animationDelay: `${i * 60}ms` }}>
      <div className="flex items-center justify-between"><span className="label-caps">{label}</span><span className={toneText[tone]}>{icon}</span></div>
      <div className={`mt-4 font-display text-4xl font-semibold tracking-tight ${tone === "ok" || tone === "info" ? "text-foreground" : toneText[tone]}`}>{value}</div>
      <p className={`mt-1 font-mono text-[11px] uppercase tracking-wider ${toneText[tone]}`}>{sub}</p>
    </div>
  );
}

function Home() {
  return (
    <>
      <PageTitle title="Command Overview" sub="Shift B · Underground Level 2 · Demo data" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Card i={0} label="Active Miners" value={String(s.activeMiners)} sub="Underground now" tone="ok" icon={<Users className="size-4" />} />
        <Card i={1} label="Helmets Online" value={`${s.helmetsOnline} / ${s.helmetsTotal}`} sub={`${s.helmetsTotal - s.helmetsOnline} offline`} tone="ok" icon={<HardHat className="size-4" />} />
        <Card i={2} label="Mine Safety" value={s.mineSafety} sub={s.mineSafetyNote} tone="ok" icon={<ShieldCheck className="size-4" />} />
        <Card i={3} label="Active Alerts" value={String(s.alerts.total).padStart(2, "0")} sub={`${s.alerts.critical} critical · ${s.alerts.warning} warning`} tone="warn" icon={<AlertTriangle className="size-4" />} />
        <Card i={4} label="Network" value={`${s.network.connected}%`} sub={s.network.name} tone="info" icon={<Network className="size-4" />} />
        <Card i={5} label="Emergency" value="CLEAR" sub={s.sos} tone="ok" icon={<Siren className="size-4" />} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="glass animate-fade-up relative overflow-hidden rounded-lg p-6" style={{ animationDelay: "200ms" }}>
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center gap-6 md:flex-row">
            <div className="relative grid size-44 shrink-0 place-items-center">
              <div className="absolute inset-0 rounded-full border-2 border-ok/30" />
              <div className="absolute inset-3 rounded-full border border-ok/20" />
              <div className="pulse-dot absolute inset-6 rounded-full bg-ok/10 text-ok" />
              <div className="text-center">
                <ShieldCheck className="mx-auto size-8 text-ok" />
                <div className="mt-1 font-display text-4xl font-bold tracking-widest text-ok">{s.mineSafety}</div>
              </div>
            </div>
            <div className="w-full">
              <p className="label-caps">Mine Safety Status</p>
              <p className="mt-2 text-muted-foreground">All monitored zones are currently within acceptable safety conditions.</p>
              <ul className="mt-4 divide-y divide-border/60">
                {s.indicators.map((x) => (
                  <li key={x.label} className="flex items-center justify-between py-2 font-mono text-xs">
                    <span className="uppercase tracking-wider text-muted-foreground">{x.label}</span>
                    <span className="flex items-center gap-2 uppercase text-ok"><Dot tone="ok" />{x.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="glass animate-fade-up rounded-lg p-5" style={{ animationDelay: "260ms" }}>
          <div className="mb-3 flex items-center justify-between"><h2 className="label-caps">Active Alerts</h2><Link to="/alerts" className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">View all alerts <ArrowRight className="size-3" /></Link></div>
          <ul className="space-y-2.5">
            {homeAlerts.map((a) => {
              const t = toneOf(a.level);
              return (
                <li key={a.title} className="flex items-start gap-3 rounded-md border bg-surface/60 p-3">
                  <span className="mt-1.5"><Dot tone={t} pulse={t === "crit"} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><span className="font-medium">{a.title}</span><span className="font-mono text-[11px] text-muted-foreground">{a.time}</span></div>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{a.helmetId} · {a.zone}</p>
                  </div>
                  <StatusBadge value={a.level === "Information" ? "Info" : a.level} tone={t} />
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="glass rounded-lg p-5">
          <h2 className="label-caps mb-3">Mine Status</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {zoneStatus.map((z) => {
              const t: Tone = z.status === "Safe" ? "ok" : toneOf(z.status);
              return (
                <div key={z.zone} className="flex items-center justify-between rounded-md border bg-surface/60 px-3 py-2.5">
                  <span className="font-display text-lg uppercase tracking-wide">{z.zone}</span>
                  <StatusBadge value={z.status} tone={t} />
                </div>
              );
            })}
          </div>
        </section>
        <section className="glass rounded-lg p-5">
          <h2 className="label-caps mb-3">Recent Activity</h2>
          <ol className="relative ml-1 border-l">
            {recentActivity.map((r) => (
              <li key={r.time} className="mb-3 ml-4 last:mb-0">
                <span className="absolute -left-[4.5px] mt-1.5"><Dot tone="info" /></span>
                <span className="font-mono text-[11px] text-muted-foreground">{r.time}</span>
                <p className="text-sm">{r.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
