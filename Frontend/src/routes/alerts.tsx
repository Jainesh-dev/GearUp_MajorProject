import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { alerts as initial, type Alert, type AlertCategory } from "@/data/mockData";
import { PageTitle, StatusBadge, toneOf } from "@/components/kit";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alert Center — GearUp" },
      { name: "description", content: "Critical, warning and informational alerts from miner helmets." },
      { property: "og:title", content: "Alert Center — GearUp" },
      { property: "og:description", content: "Critical, warning and informational alerts from miner helmets." },
    ],
  }),
  component: AlertsPage,
});

const cats: (AlertCategory | "All")[] = ["All", "Critical", "Warning", "Information", "Resolved"];

function AlertsPage() {
  const [list, setList] = useState<Alert[]>(initial);
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const update = (id: string, patch: Partial<Alert>) => setList((l) => l.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const rows = list.filter((a) => cat === "All" || a.category === cat);
  return (
    <>
      <PageTitle title="Alert Center" sub="Actions here are local to this demo session." />
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-sm border px-3 py-2 font-mono text-xs ${cat === c ? "border-primary text-primary" : "text-muted-foreground"}`}>
            {c} <span className="opacity-60">{c === "All" ? list.length : list.filter((a) => a.category === c).length}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((a) => {
          const t = toneOf(a.category);
          return (
            <article key={a.id} className={`rounded-md border bg-card p-4 ${t === "crit" && a.status === "Active" ? "border-crit/50" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{a.type}</h3>
                <StatusBadge value={a.category} tone={t} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-1 font-mono text-xs sm:grid-cols-4">
                <div><dt className="label-caps">Miner</dt><dd>{a.miner}</dd></div>
                <div><dt className="label-caps">Helmet</dt><dd className="text-primary">{a.helmetId}</dd></div>
                <div><dt className="label-caps">Zone</dt><dd>{a.zone}</dd></div>
                <div><dt className="label-caps">Time</dt><dd>{a.time}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge value={a.status} tone={a.status === "Active" ? t : toneOf(a.status)} />
                <div className="ml-auto flex gap-2">
                  {a.helmetId.startsWith("H") && <Link to="/miners/$id" params={{ id: a.helmetId }} className="rounded-sm border px-3 py-1.5 text-xs hover:border-primary hover:text-primary">View Miner</Link>}
                  {a.status === "Active" && <button onClick={() => update(a.id, { status: "Acknowledged" })} className="rounded-sm border border-warn/50 px-3 py-1.5 text-xs text-warn hover:bg-warn/10">Acknowledge</button>}
                  {a.status !== "Resolved" && <button onClick={() => update(a.id, { status: "Resolved", category: "Resolved" })} className="rounded-sm border border-ok/50 px-3 py-1.5 text-xs text-ok hover:bg-ok/10">Resolve</button>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
