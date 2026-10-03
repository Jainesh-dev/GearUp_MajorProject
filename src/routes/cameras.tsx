import { createFileRoute } from "@tanstack/react-router";
import { VideoOff } from "lucide-react";
import { cameras } from "@/data/mockData";
import { PageTitle } from "@/components/kit";

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
      <PageTitle title="Camera Space" sub="No cameras are connected yet — placeholders shown in demo mode." />
      <div className="grid gap-4 md:grid-cols-2">
        {cameras.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-md border bg-card">
            <div className="relative aspect-video bg-surface scanlines">
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <VideoOff className="mx-auto size-8 text-off" />
                  <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Camera Feed Unavailable – Demo Mode</p>
                </div>
              </div>
              <span className="absolute left-3 top-3 flex items-center gap-1.5 font-mono text-[11px] text-off"><span className="size-2 rounded-full bg-off" /> NO SIGNAL</span>
              <span className="absolute right-3 top-3 font-mono text-[11px] text-muted-foreground">{c.id}</span>
              {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "left-2 bottom-2 border-l border-b", "right-2 bottom-2 border-r border-b"].map((p) => <span key={p} className={`absolute size-5 border-primary/60 ${p}`} />)}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-display text-lg font-semibold uppercase tracking-wide">Camera {c.id.slice(-2)} – {c.name}</span>
              <span className="label-caps">Offline</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
