import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, BarChart3, Camera, Cpu, HardHat, LayoutDashboard, Map, Menu, Siren, Users, X, CalendarCheck } from "lucide-react";
import { Dot } from "./kit";
import { SOSModal } from "./SOSModal";

const nav = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/miners", label: "Miners", icon: Users },
  { to: "/map", label: "Mine Map", icon: Map },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/cameras", label: "Camera Space", icon: Camera },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/health", label: "Helmet Health", icon: Cpu },
] as const;

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="font-mono text-xs text-muted-foreground">--</span>;
  return (
    <div className="text-right font-mono text-xs leading-tight">
      <div className="text-foreground">{now.toLocaleTimeString()}</div>
      <div className="text-muted-foreground">{now.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sos, setSos] = useState(false);

  const NavList = (
    <nav className="flex flex-col gap-0.5 p-3">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-sm border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          activeProps={{ className: "!border-primary bg-accent !text-foreground" }}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-surface lg:flex">
        <Brand />
        {NavList}
        <div className="mt-auto p-3">
          <SOSButton onClick={() => setSos(true)} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-64 border-r bg-surface" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pr-3"><Brand /><button onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button></div>
            {NavList}
            <div className="p-3"><SOSButton onClick={() => { setOpen(false); setSos(true); }} /></div>
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-surface/95 px-4 py-3 backdrop-blur md:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <div className="min-w-0">
            <p className="label-caps hidden sm:block">GearUp Control Center</p>
            <p className="truncate font-display text-lg font-medium uppercase tracking-wide">Smart Mining Helmet Monitoring System</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden items-center gap-2 rounded-sm border border-ok/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ok sm:inline-flex">
              <Dot tone="ok" pulse /> All Systems Operational
            </span>
            <Clock />
            <button onClick={() => setSos(true)} className="rounded-sm bg-crit p-2 text-destructive-foreground lg:hidden" aria-label="SOS"><Siren className="size-4" /></button>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 md:p-6">{children}</main>
      </div>
      <SOSModal open={sos} onOpenChange={setSos} />
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground"><HardHat className="size-5" /></div>
      <div>
        <div className="font-display text-xl font-bold uppercase leading-none tracking-wider">GearUp</div>
        <div className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground"><Activity className="size-3" /> Smart Helmet</div>
      </div>
    </div>
  );
}

function SOSButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full overflow-hidden rounded-sm border border-crit/60 bg-crit/10 text-crit transition-colors hover:bg-crit/20">
      
      <div className="flex items-center justify-center gap-2 py-2.5 font-display text-base font-semibold uppercase tracking-widest"><Siren className="size-4" /> SOS</div>
    </button>
  );
}
