
const API_URL = "http://127.0.0.1:8000";

// --------------------
// Sensor and helmet types
// --------------------

export interface HelmetData {
  helmet_id: string;
  miner_name: string | null;
  zone: string | null;
  status: "online" | "offline";
  battery: number | null;
  last_seen: string | null;
  temperature: number | null;
  humidity: number | null;
  mq4: number | null;
  mq135: number | null;
  mq2: number | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  impact: boolean;
  timestamp: string | null;
}

export interface SensorReading {
  id: number;
  helmet_id: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  mq4: number | null;
  mq135: number | null;
  mq2: number | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  impact: boolean;
  battery: number | null;
}

// --------------------
// Dashboard overview
// --------------------

export interface HelmetSummary {
  helmet_id: string;
  miner_name: string | null;
  zone: string | null;
  status: "online" | "offline";
  battery: number | null;
  last_seen: string | null;
}

export interface DashboardOverview {
  total_helmets: number;
  online: number;
  offline: number;
  active_incidents: number;
  critical_incidents: number;
  helmets: HelmetSummary[];
}

// --------------------
// Incident types
// --------------------

export type IncidentStatus = "active" | "acknowledged" | "resolved";

export type IncidentSeverity = "warning" | "critical";

export interface Incident {
  id: number;
  helmet_id: string;
  miner_name: string | null;
  zone: string | null;
  incident_type: string;
  severity: string;
  message: string;
  status: IncidentStatus | string;
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface SOSRequest {
  helmet_id: string;
  message?: string;
}

export interface IncidentAction {
  actor: string;
}

export interface SOSResponse {
  message: string;
  incident_id: number;
  status: string;
}

// --------------------
// Shared HTTP helper
// --------------------

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the GearUp backend. Check that the API is running."
    );
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;

    try {
      const body = (await response.json()) as {
        detail?: string;
        message?: string;
      };

      detail = body.detail ?? body.message ?? detail;
    } catch {
      // Keep the HTTP status if the response has no JSON body.
    }

    throw new Error(detail);
  }

  return (await response.json()) as T;
}

// --------------------
// Existing sensor APIs
// --------------------

export async function getHelmetData(
  helmetId: string
): Promise<HelmetData> {
  return apiRequest<HelmetData>(
    `/api/helmets/${encodeURIComponent(helmetId)}/latest`
  );
}

export async function getHelmetReadings(
  helmetId: string
): Promise<SensorReading[]> {
  return apiRequest<SensorReading[]>(
    `/api/helmets/${encodeURIComponent(helmetId)}/readings`
  );
}

// --------------------
// Dashboard APIs
// --------------------

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return apiRequest<DashboardOverview>("/api/dashboard/overview");
}

export async function getIncidents(
  activeOnly = false
): Promise<Incident[]> {
  const query = activeOnly ? "?active_only=true" : "";

  return apiRequest<Incident[]>(`/api/incidents${query}`);
}

// --------------------
// Incident management APIs
// --------------------

export async function createSOS(
  data: SOSRequest
): Promise<SOSResponse> {
  return apiRequest<SOSResponse>("/api/incidents/sos", {
    method: "POST",
    body: JSON.stringify({
      helmet_id: data.helmet_id,
      message: data.message ?? "Emergency SOS triggered",
    }),
  });
}

export async function acknowledgeIncident(
  incidentId: number,
  actor: string
): Promise<{ message: string; incident_id: number; status: string }> {
  return apiRequest(`/api/incidents/${incidentId}/acknowledge`, {
    method: "POST",
    body: JSON.stringify({ actor }),
  });
}

export async function resolveIncident(
  incidentId: number,
  actor: string
): Promise<{ message: string; incident_id: number; status: string }> {
  return apiRequest(`/api/incidents/${incidentId}/resolve`, {
    method: "POST",
    body: JSON.stringify({ actor }),
  });
}
