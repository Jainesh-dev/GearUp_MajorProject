import { createFileRoute, Link } from "@tanstack/react-router";
import { helmets } from "@/data/mockData";
import { PageTitle, Panel, StatusBadge, toneOf } from "@/components/kit";
import { MineMap } from "@/components/MineMap";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Mine Map — GearUp" },
      { name: "description", content: "Mock mine layout with zones, tunnels, exits and helmet markers." },
      { property: "og:title", content: "Mine Map — GearUp" },
      { property: "og:description", content: "Mock mine layout with zones, tunnels, exits and helmet markers." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <>
      <PageTitle title="Mine Map" sub="Illustrative mock layout — not real GPS tracking." />
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <MineMap />
        <Panel title="Helmets on map">
          <ul className="max-h-[480px] space-y-1 overflow-y-auto">
            {helmets.map((h) => (
              <li key={h.id}>
                <Link to="/miners/$id" params={{ id: h.id }} className="flex items-center justify-between gap-2 rounded-sm px-2 py-2 hover:bg-accent">
                  <span><span className="font-mono text-primary">{h.id}</span> <span className="text-sm">{h.miner}</span><br /><span className="font-mono text-[11px] text-muted-foreground">{h.zone}</span></span>
                  <StatusBadge value={h.status} tone={toneOf(h.status === "Online" ? "Normal" : h.status)} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
