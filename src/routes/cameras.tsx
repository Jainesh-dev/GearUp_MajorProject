import { createFileRoute } from "@tanstack/react-router";
import { cameraMeta, cameras } from "@/data/mockData";
import { PageTitle, StatusBadge } from "@/components/kit";

export const Route = createFileRoute("/cameras")({
  head: () => ({
    meta: [
      { title: "Camera Space — GearUp" },
      { name: "description", content: "CCTV monitoring panels for mine entrances, tunnels and exits (demo mode)." },
      { property: "og:title", content: "Camera Space — GearUp" },
      { property: "og:description", content: "CCTV monitoring panels for mine entrances, tunnels and exits (demo mode)." },
    ],
  }),
  component: CamerasPage,
});

function CamerasPage() {
  return (
    <>
      <PageTitle title="Camera Space" sub="Demo feeds — no real cameras are connected yet." />
      <div className="grid gap-5 md:grid-cols-2">
        {cameras.map((c) => {
          const m = cameraMeta[c.id] ?? { status: "Offline" as const, lastUpdate: "—" };
          const on = m.status === "Online";
          return (
            <article key={c.id} className="glass overflow-hidden rounded-lg">
              <div className="relative aspect-video overflow-hidden bg-surface">
                {/* tunnel perspective */}
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 55%, var(--muted) 0%, var(--surface) 55%)", opacity: on ? 1 : 0.3 }} />
                <div className="absolute left-1/2 top-[55%] h-1/3 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-t-full border-2 border-border bg-background/60" style={{ opacity: on ? 1 : 0.3 }} />
                <div className="scanlines absolute inset-0" />
                <span className="absolute left-3 top-3 flex items-center gap-1.5 font-mono text-[11px]"><span className={`size-2 rounded-full ${on ? "pulse-dot bg-crit text-crit" : "bg-off"}`} />{on ? "REC · DEMO FEED" : "NO SIGNAL"}</span>
                <span className="absolute right-3 top-3 font-mono text-[11px] text-muted-foreground">{c.id}</span>
                <span className="absolute bottom-3 left-3 font-mono text-[11px] text-muted-foreground">CAMERA FEED · DEMO MODE</span>
                <span className="absolute bottom-3 right-3 font-mono text-[11px] text-muted-foreground">{m.lastUpdate}</span>
                {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "left-2 bottom-2 border-l border-b", "right-2 bottom-2 border-r border-b"].map((p) => <span key={p} className={`absolute size-5 border-primary/60 ${p}`} />)}
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-mono text-xs text-primary">{c.id}</p>
                  <p className="font-display text-lg font-semibold uppercase tracking-wide">{c.name}</p>
                </div>
                <div className="text-right">
                  <StatusBadge value={m.status} tone={on ? "ok" : "off"} />
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">Updated {m.lastUpdate}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
