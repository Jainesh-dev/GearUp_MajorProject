import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "ok" | "warn" | "crit" | "off" | "info";

export function toneOf(value: string | number): Tone {
  const v = String(value);
  if (["Critical", "Poor", "Detected", "Alert", "Disconnected", "Unavailable", "Absent"].includes(v)) return "crit";
  if (["Warning", "Moderate", "Weak", "Searching", "Late", "Acknowledged"].includes(v)) return "warn";
  if (["Offline", "Resolved"].includes(v)) return "off";
  if (["Information"].includes(v)) return "info";
  return "ok";
}

export function batteryTone(b: number): Tone {
  return b === 0 ? "off" : b < 20 ? "crit" : b < 40 ? "warn" : "ok";
}

const toneText: Record<Tone, string> = { ok: "text-ok", warn: "text-warn", crit: "text-crit", off: "text-off", info: "text-info" };
const toneBg: Record<Tone, string> = { ok: "bg-ok", warn: "bg-warn", crit: "bg-crit", off: "bg-off", info: "bg-info" };
const toneBorder: Record<Tone, string> = { ok: "border-ok/40", warn: "border-warn/40", crit: "border-crit/50", off: "border-off/40", info: "border-info/40" };

export function Dot({ tone, pulse }: { tone: Tone; pulse?: boolean }) {
  return <span className={cn("inline-block size-2 rounded-full", toneBg[tone], toneText[tone], pulse && "pulse-dot")} />;
}

export function StatusBadge({ value, tone }: { value: string; tone?: Tone }) {
  const t = tone ?? toneOf(value);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider", toneText[t], toneBorder[t], "bg-surface")}>
      <Dot tone={t} pulse={t === "crit"} />
      {value}
    </span>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-md border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <h2 className="label-caps">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, unit, tone = "ok", icon, note }: { label: string; value: string | number; unit?: string; tone?: Tone; icon?: ReactNode; note?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md border bg-card p-4")}>
      <div className={cn("absolute inset-y-0 left-0 w-1", toneBg[tone])} />
      <div className="flex items-start justify-between">
        <span className="label-caps">{label}</span>
        <span className={cn(toneText[tone])}>{icon}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="font-mono text-sm text-muted-foreground">{unit}</span>}
      </div>
      {note && <p className={cn("mt-1 font-mono text-[11px]", toneText[tone])}>{note}</p>}
    </div>
  );
}

export function SensorCard({ label, value, unit, tone, icon, sub }: { label: string; value: string | number; unit?: string; tone: Tone; icon: ReactNode; sub?: string }) {
  return (
    <div className={cn("rounded-md border bg-surface p-4", toneBorder[tone])}>
      <div className="flex items-center justify-between">
        <span className="label-caps">{label}</span>
        <span className={toneText[tone]}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cn("font-display text-2xl font-semibold", toneText[tone])}>{value}</span>
        {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
      </div>
      {sub && <p className="mt-1 font-mono text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export const chartTheme = {
  grid: "var(--border)",
  axis: { fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "JetBrains Mono" },
  tooltip: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, color: "var(--foreground)" },
};
