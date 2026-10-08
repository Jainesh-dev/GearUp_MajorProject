import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Search, UserCheck, UserX, Users } from "lucide-react";
import { attendance, shifts } from "@/data/mockData";
import { PageTitle, StatCard, StatusBadge } from "@/components/kit";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — GearUp" },
      { name: "description", content: "Shift attendance with RFID entry and exit times for every miner." },
      { property: "og:title", content: "Attendance — GearUp" },
      { property: "og:description", content: "Shift attendance with RFID entry and exit times for every miner." },
    ],
  }),
  component: AttendancePage,
});

const statuses = ["All", "Present", "Absent", "Late"] as const;
const field = "rounded-md border bg-card px-3 py-2 text-sm outline-none focus:border-primary";

function AttendancePage() {
  const [date, setDate] = useState("2026-10-05");
  const [shift, setShift] = useState(shifts[1]!);
  const [q, setQ] = useState("");
  const [st, setSt] = useState<(typeof statuses)[number]>("All");
  const count = (s: string) => attendance.filter((a) => a.status === s).length;
  const rows = attendance.filter((a) => (st === "All" || a.status === st) && `${a.miner} ${a.helmetId}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Attendance" sub="RFID check-in log · demo data" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Miners" value={attendance.length} icon={<Users className="size-4" />} />
        <StatCard label="Present" value={count("Present")} icon={<UserCheck className="size-4" />} />
        <StatCard label="Absent" value={count("Absent")} tone="crit" icon={<UserX className="size-4" />} />
        <StatCard label="Late" value={count("Late")} tone="warn" icon={<Clock className="size-4" />} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${field} [color-scheme:dark]`} />
        <select value={shift} onChange={(e) => setShift(e.target.value)} className={field}>{shifts.map((s) => <option key={s}>{s}</option>)}</select>
        <div className="flex items-center gap-2 rounded-md border bg-card px-3"><Search className="size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search miner or helmet" className="w-48 bg-transparent py-2 text-sm outline-none" /></div>
        <div className="flex gap-1">{statuses.map((s) => <button key={s} onClick={() => setSt(s)} className={`rounded-md border px-3 py-2 font-mono text-xs ${st === s ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}>{s}</button>)}</div>
      </div>
      <div className="glass mt-3 overflow-x-auto rounded-lg">
        <table className="w-full min-w-[700px] text-sm">
          <thead><tr className="text-left">{["Miner", "Helmet ID", "Entry Time", "Exit Time", "Zone", "Status"].map((h) => <th key={h} className="label-caps border-b px-4 py-3 font-normal">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.helmetId} className="border-t hover:bg-accent/40">
                <td className="px-4 py-3 font-medium">{a.miner}</td>
                <td className="px-4 py-3 font-mono text-primary">{a.helmetId}</td>
                <td className="px-4 py-3 font-mono">{a.entry}</td>
                <td className="px-4 py-3 font-mono">{a.exit}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.status === "Absent" ? "—" : a.zone}</td>
                <td className="px-4 py-3"><StatusBadge value={a.status} tone={a.status === "Present" ? "ok" : undefined} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
