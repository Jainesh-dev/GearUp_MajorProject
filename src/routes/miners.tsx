import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { helmets } from "@/data/mockData";
import { PageTitle } from "@/components/kit";
import { MinerTable } from "@/components/MinerTable";

export const Route = createFileRoute("/miners")({
  head: () => ({
    meta: [
      { title: "Miners — GearUp" },
      { name: "description", content: "All miners and their helmet sensor readings." },
      { property: "og:title", content: "Miners — GearUp" },
      { property: "og:description", content: "All miners and their helmet sensor readings." },
    ],
  }),
  component: MinersLayout,
});

function MinersLayout() {
  const child = useMatch({ from: "/miners/$id", shouldThrow: false });
  if (child) return <Outlet />;
  return <MinersPage />;
}

function MinersPage() {
  const [q, setQ] = useState("");
  const [zone, setZone] = useState("All");
  const zones = ["All", ...Array.from(new Set(helmets.map((h) => h.zone)))];
  const rows = helmets.filter((h) => (zone === "All" || h.zone === zone) && `${h.id} ${h.miner}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Miners" sub={`${helmets.length} helmets registered`} />
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded-sm border bg-card px-3"><Search className="size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or helmet ID" className="w-56 bg-transparent py-2 text-sm outline-none" /></div>
        {zones.map((z) => (
          <button key={z} onClick={() => setZone(z)} className={`rounded-sm border px-3 py-2 font-mono text-xs ${zone === z ? "border-primary text-primary" : "text-muted-foreground"}`}>{z}</button>
        ))}
      </div>
      <MinerTable rows={rows} />
    </>
  );
}
