import { createFileRoute, Link } from "@tanstack/react-router";
import { components, helmetHealth, helmets } from "@/data/mockData";
import { Dot, PageTitle, StatusBadge, batteryTone, toneOf } from "@/components/kit";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Helmet Health — GearUp" },
      { name: "description", content: "Hardware status of ESP32, gas sensors, GPS, LoRa, RFID and battery on every helmet." },
      { property: "og:title", content: "Helmet Health — GearUp" },
      { property: "og:description", content: "Hardware status of ESP32, gas sensors, GPS, LoRa, RFID and battery on every helmet." },
    ],
  }),
  component: HealthPage,
});

function HealthPage() {
  return (
    <>
      <PageTitle title="Helmet Health" sub="Component diagnostics for every helmet" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {helmets.map((h) => {
          const hh = helmetHealth(h);
          return (
            <article key={h.id} className="rounded-md border bg-card">
              <header className="flex items-center justify-between border-b px-4 py-2.5">
                <Link to="/miners/$id" params={{ id: h.id }} className="hover:text-primary"><span className="font-mono text-primary">{h.id}</span> <span className="text-sm text-muted-foreground">{h.miner}</span></Link>
                <StatusBadge value={h.status} tone={toneOf(h.status === "Online" ? "Normal" : h.status)} />
              </header>
              <ul className="grid grid-cols-2 gap-x-4 px-4 py-3 font-mono text-xs">
                {components.map((c) => {
                  const v = hh[c];
                  const t = c === "Battery" ? batteryTone(h.battery) : toneOf(v);
                  return (
                    <li key={c} className="flex items-center justify-between border-b border-dashed py-1.5 last:border-0">
                      <span className="text-muted-foreground">{c}</span>
                      <span className="flex items-center gap-1.5"><Dot tone={t} />{v}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </>
  );
}
