
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  HardHat,
  ShieldCheck,
  Siren,
  Users,
  RefreshCw,
  CheckCircle2,
  Wifi,
  MapPin,
  Clock,
} from "lucide-react";

import {
  getDashboardOverview,
  getIncidents,
  acknowledgeIncident,
  resolveIncident,
  createSOS,
  type DashboardOverview,
  type Incident,
  type HelmetSummary,
} from "@/lib/api";

import {
  Dot,
  PageTitle,
  StatusBadge,
  toneOf,
  type Tone,
} from "@/components/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — GearUp Smart Mining Helmet" },
      {
        name: "description",
        content: "Live miner, helmet, and incident monitoring.",
      },
    ],
  }),
  component: Home,
});

const toneText: Record<Tone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  crit: "text-crit",
  off: "text-off",
  info: "text-info",
};

function Card({
  label,
  value,
  sub,
  tone,
  icon,
  i,
}: {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
  icon: ReactNode;
  i: number;
}) {
  return (
    <div
      className="glass animate-fade-up rounded-lg p-5"
      style={{ animationDelay: `${i * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="label-caps">{label}</span>
        <span className={toneText[tone]}>{icon}</span>
      </div>
      <div
        className={`mt-4 font-display text-4xl font-semibold tracking-tight ${
          tone === "ok" || tone === "info"
            ? "text-foreground"
            : toneText[tone]
        }`}
      >
        {value}
      </div>
      <p
        className={`mt-1 font-mono text-[11px] uppercase tracking-wider ${toneText[tone]}`}
      >
        {sub}
      </p>
    </div>
  );
}

function formatTime(value: string | null | undefined) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString();
}

function statusTone(status: string): Tone {
  if (status === "online" || status === "resolved" || status === "Safe") {
    return "ok";
  }

  if (status === "acknowledged" || status === "warning") {
    return "warn";
  }

  if (status === "active" || status === "critical" || status === "Unsafe") {
    return "crit";
  }

  return "off";
}

function Home() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [sosHelmetId, setSosHelmetId] = useState("");
  const [sosBusy, setSosBusy] = useState(false);

  const refreshDashboard = useCallback(async (background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [overviewData, incidentData] = await Promise.all([
        getDashboardOverview(),
        getIncidents(false),
      ]);

      setOverview(overviewData);
      setIncidents(incidentData);
      setError("");

      setSosHelmetId((current) => {
        if (
          current &&
          overviewData.helmets.some((helmet) => helmet.helmet_id === current)
        ) {
          return current;
        }

        return overviewData.helmets[0]?.helmet_id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load live monitoring data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshDashboard();

    const intervalId = window.setInterval(() => {
      void refreshDashboard(true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [refreshDashboard]);

  const handleIncidentAction = async (
    incident: Incident,
    action: "acknowledge" | "resolve"
  ) => {
    setWorkingId(incident.id);
    setActionMessage("");
    setActionError("");

    try {
      // Replace this with the authenticated operator's identity
      // when user authentication is implemented.
      const actor = "Control Room";

      if (action === "acknowledge") {
        await acknowledgeIncident(incident.id, actor);
        setActionMessage(`Incident #${incident.id} acknowledged.`);
      } else {
        await resolveIncident(incident.id, actor);
        setActionMessage(`Incident #${incident.id} resolved.`);
      }

      await refreshDashboard(true);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Incident action failed."
      );
    } finally {
      setWorkingId(null);
    }
  };

  const handleCreateSOS = async () => {
    if (!sosHelmetId) {
      setActionError("No registered helmet is available.");
      return;
    }

    const confirmed = window.confirm(
      `Create a critical SOS incident for helmet ${sosHelmetId}? This will save an incident to the database.`
    );

    if (!confirmed) return;

    setSosBusy(true);
    setActionMessage("");
    setActionError("");

    try {
      const result = await createSOS({
        helmet_id: sosHelmetId,
        message: "Operator-triggered SOS from GearUp dashboard",
      });

      setActionMessage(result.message);
      await refreshDashboard(true);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to create SOS."
      );
    } finally {
      setSosBusy(false);
    }
  };

  const helmets: HelmetSummary[] = overview?.helmets ?? [];
  const activeIncidents = incidents.filter(
    (incident) =>
      incident.status === "active" || incident.status === "acknowledged"
  );
  const criticalIncidents = activeIncidents.filter(
    (incident) => incident.severity.toLowerCase() === "critical"
  );

  const zoneNames = [
    ...new Set(
      helmets.map((helmet) => helmet.zone).filter(
        (zone): zone is string => Boolean(zone)
      )
    ),
  ];

  const safetyStatus =
    criticalIncidents.length > 0
      ? "ALERT"
      : activeIncidents.length > 0
        ? "REVIEW"
        : "NO ACTIVE INCIDENTS";

  const safetyTone: Tone =
    criticalIncidents.length > 0
      ? "crit"
      : activeIncidents.length > 0
        ? "warn"
        : "info";

  return (
    <>
      <PageTitle
        title="Command Overview"
        sub="Live monitoring · API-connected helmet and incident data"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span
            className={`size-2 rounded-full ${
              error ? "bg-crit" : "bg-ok"
            }`}
          />
          {error ? "API CONNECTION ISSUE" : "AUTO-REFRESH · 5 SECONDS"}
        </div>

        <button
          type="button"
          onClick={() => void refreshDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh now
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-crit/40 bg-crit/10 p-4 text-sm"
        >
          <div className="flex items-center gap-2 font-semibold text-crit">
            <AlertTriangle className="size-4" />
            Could not refresh live data
          </div>
          <p className="mt-1 text-muted-foreground">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Check that FastAPI is running and the overview and incidents
            endpoints are available.
          </p>
        </div>
      )}

      {actionMessage && (
        <div
          role="status"
          className="mb-4 rounded-md border border-ok/30 bg-ok/10 p-3 text-sm"
        >
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-crit/30 bg-crit/10 p-3 text-sm text-crit"
        >
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card
          i={0}
          label="Registered Helmets"
          value={loading && !overview ? "—" : String(overview?.total_helmets ?? 0)}
          sub="From database"
          tone="info"
          icon={<HardHat className="size-4" />}
        />

        <Card
          i={1}
          label="Helmets Online"
          value={loading && !overview ? "—" : String(overview?.online ?? 0)}
          sub={`${overview?.offline ?? 0} offline`}
          tone={(overview?.offline ?? 0) > 0 ? "warn" : "ok"}
          icon={<Wifi className="size-4" />}
        />

        <Card
          i={2}
          label="Zones Registered"
          value={loading && !overview ? "—" : String(zoneNames.length)}
          sub="Distinct assigned zones"
          tone="info"
          icon={<MapPin className="size-4" />}
        />

        <Card
          i={3}
          label="Active Incidents"
          value={loading && !overview ? "—" : String(overview?.active_incidents ?? 0)}
          sub={`${criticalIncidents.length} critical`}
          tone={activeIncidents.length > 0 ? "warn" : "ok"}
          icon={<AlertTriangle className="size-4" />}
        />

        <Card
          i={4}
          label="Emergency Status"
          value={loading && !overview ? "—" : safetyStatus}
          sub="Based on recorded incidents"
          tone={safetyTone}
          icon={<Siren className="size-4" />}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <section className="glass relative overflow-hidden rounded-lg p-6">
          <div className="grid-bg absolute inset-0 opacity-30" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`size-5 ${toneText[safetyTone]}`} />
              <h2 className="label-caps">Incident Overview</h2>
            </div>

            <p className="mt-3 font-display text-2xl font-semibold">
              {loading && !overview ? "Loading…" : safetyStatus}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              This status reflects recorded active incidents only. It is not
              a guarantee that underground conditions are safe.
            </p>

            <ul className="mt-5 divide-y divide-border/60">
              <li className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Registered helmets</span>
                <span className="font-mono">
                  {overview?.total_helmets ?? "—"}
                </span>
              </li>
              <li className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Connected helmets</span>
                <span className="flex items-center gap-2 font-mono">
                  <Dot tone="ok" />
                  {overview?.online ?? "—"}
                </span>
              </li>
              <li className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Critical incidents</span>
                <span className={`font-mono ${toneText[criticalIncidents.length ? "crit" : "ok"]}`}>
                  {criticalIncidents.length}
                </span>
              </li>
            </ul>

            <div className="mt-5 border-t border-border/60 pt-4">
              <label className="label-caps" htmlFor="sos-helmet">
                Operator SOS Test
              </label>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <select
                  id="sos-helmet"
                  value={sosHelmetId}
                  onChange={(event) => setSosHelmetId(event.target.value)}
                  disabled={helmets.length === 0 || sosBusy}
                  className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {helmets.length === 0 && (
                    <option value="">No registered helmets</option>
                  )}
                  {helmets.map((helmet) => (
                    <option key={helmet.helmet_id} value={helmet.helmet_id}>
                      {helmet.helmet_id}
                      {helmet.miner_name ? ` — ${helmet.miner_name}` : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => void handleCreateSOS()}
                  disabled={!sosHelmetId || sosBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-crit/40 bg-crit/10 px-3 py-2 text-sm text-crit hover:bg-crit/20 disabled:opacity-50"
                >
                  <Siren className="size-4" />
                  {sosBusy ? "Submitting…" : "Create SOS"}
                </button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Test action: this creates a real database incident. It does not
                trigger a physical helmet button or verify an actual emergency.
              </p>
            </div>
          </div>
        </section>

        <section className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="label-caps">Active Incidents</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {activeIncidents.length} unresolved
            </span>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center">
              <CheckCircle2 className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-2 font-medium">No recorded active incidents</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This does not confirm that all mine conditions are safe.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {activeIncidents.map((incident) => {
                const tone = statusTone(
                  incident.severity.toLowerCase() === "critical"
                    ? "critical"
                    : incident.status
                );

                return (
                  <li
                    key={incident.id}
                    className="rounded-md border bg-surface/60 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1">
                        <Dot tone={tone} pulse={tone === "crit"} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">
                            {incident.incident_type} · Helmet {incident.helmet_id}
                          </span>
                          <StatusBadge
                            value={incident.severity}
                            tone={tone}
                          />
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {incident.message}
                        </p>

                        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                          {incident.miner_name || "Miner not assigned"}
                          {" · "}
                          {incident.zone || "Zone not assigned"}
                        </p>

                        <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          {formatTime(incident.created_at)}
                        </p>

                        {incident.status === "acknowledged" && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Acknowledged by {incident.acknowledged_by || "operator"}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {incident.status === "active" && (
                            <button
                              type="button"
                              disabled={workingId === incident.id}
                              onClick={() =>
                                void handleIncidentAction(incident, "acknowledge")
                              }
                              className="rounded-md border px-3 py-1.5 text-xs hover:bg-surface disabled:opacity-50"
                            >
                              Acknowledge
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={workingId === incident.id}
                            onClick={() =>
                              void handleIncidentAction(incident, "resolve")
                            }
                            className="rounded-md border border-ok/40 px-3 py-1.5 text-xs text-ok hover:bg-ok/10 disabled:opacity-50"
                          >
                            {workingId === incident.id ? "Saving…" : "Resolve"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="glass rounded-lg p-5">
          <h2 className="label-caps mb-3">Registered Zones</h2>

          {zoneNames.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No zone assignments are available in the database.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {zoneNames.map((zone) => {
                const zoneHelmets = helmets.filter(
                  (helmet) => helmet.zone === zone
                );
                const offline = zoneHelmets.filter(
                  (helmet) => helmet.status === "offline"
                ).length;

                return (
                  <div
                    key={zone}
                    className="rounded-md border bg-surface/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg uppercase tracking-wide">
                        {zone}
                      </span>
                      <StatusBadge
                        value={offline > 0 ? "Attention" : "Connected"}
                        tone={offline > 0 ? "warn" : "ok"}
                      />
                    </div>
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      {zoneHelmets.length} helmet(s)
                      {" · "}
                      {offline} offline
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="glass rounded-lg p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label-caps">Registered Miners & Helmets</h2>
            <Users className="size-4 text-muted-foreground" />
          </div>

          {helmets.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              {loading
                ? "Loading registered helmets…"
                : "No helmets are registered in the database."}
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {helmets.map((helmet) => (
                <div
                  key={helmet.helmet_id}
                  className="flex items-start justify-between gap-3 rounded-md border bg-surface/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {helmet.miner_name || "Unassigned miner"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {helmet.helmet_id}
                      {" · "}
                      {helmet.zone || "No zone"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last seen: {formatTime(helmet.last_seen)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <StatusBadge
                      value={helmet.status}
                      tone={statusTone(helmet.status)}
                    />
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      Battery:{" "}
                      {helmet.battery == null
                        ? "Unknown"
                        : `${helmet.battery}%`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
