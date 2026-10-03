import { createFileRoute } from "@tanstack/react-router";
import { Clock, LogIn, LogOut, UserCheck, UserX, Users } from "lucide-react";
import { attendance } from "@/data/mockData";
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

function AttendancePage() {
  const count = (s: string) => attendance.filter((a) => a.status === s).length;
  return (
    <>
      <PageTitle title="Attendance" sub="Shift B · RFID check-in log" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Miners" value={attendance.length} icon={<Users className="size-4" />} />
        <StatCard label="Present" value={count("Present")} icon={<UserCheck className="size-4" />} />
        <StatCard label="Absent" value={count("Absent")} tone="crit" icon={<UserX className="size-4" />} />
        <StatCard label="Late" value={count("Late")} tone="warn" icon={<Clock className="size-4" />} />
        <StatCard label="Shift Entry" value="08:00" tone="info" icon={<LogIn className="size-4" />} />
        <StatCard label="Shift Exit" value="16:00" tone="info" icon={<LogOut className="size-4" />} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-surface"><tr className="text-left">{["Miner Name", "Helmet ID", "Entry Time", "Exit Time", "Status", "Zone"].map((h) => <th key={h} className="label-caps px-4 py-2.5 font-normal">{h}</th>)}</tr></thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.helmetId} className="border-t hover:bg-accent/50">
                <td className="px-4 py-3 font-medium">{a.miner}</td>
                <td className="px-4 py-3 font-mono text-primary">{a.helmetId}</td>
                <td className="px-4 py-3 font-mono">{a.entry}</td>
                <td className="px-4 py-3 font-mono">{a.exit}</td>
                <td className="px-4 py-3"><StatusBadge value={a.status} tone={a.status === "Present" ? "ok" : undefined} /></td>
                <td className="px-4 py-3 text-muted-foreground">{a.zone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
