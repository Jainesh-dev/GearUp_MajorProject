// All static/mock data lives here. Replace these exports with ESP32 → API data later
// (keep the same shapes) and the UI will not need redesigning.

export type Level = "Normal" | "Warning" | "Critical";
export type HelmetStatus = "Online" | "Warning" | "Critical" | "Offline";

export interface Helmet {
  id: string;
  miner: string;
  temperature: number;
  humidity: number;
  methane: Level;
  methanePpm: number;
  airQuality: "Good" | "Moderate" | "Poor";
  aqi: number;
  impact: "Normal" | "Detected";
  battery: number;
  status: HelmetStatus;
  zone: string;
  lastUpdated: string;
  lora: "Connected" | "Weak" | "Disconnected";
  gps: "Available" | "Searching" | "Unavailable";
  map: { x: number; y: number };
}

export const helmets: Helmet[] = [
  { id: "H001", miner: "Rahul Sharma", temperature: 31.4, humidity: 64, methane: "Normal", methanePpm: 120, airQuality: "Good", aqi: 42, impact: "Normal", battery: 87, status: "Online", zone: "Zone A", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 18, y: 30 } },
  { id: "H002", miner: "Amit Verma", temperature: 30.8, humidity: 61, methane: "Normal", methanePpm: 110, airQuality: "Good", aqi: 38, impact: "Normal", battery: 92, status: "Online", zone: "Zone A", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 26, y: 38 } },
  { id: "H003", miner: "Suresh Patil", temperature: 38.6, humidity: 70, methane: "Normal", methanePpm: 180, airQuality: "Moderate", aqi: 88, impact: "Normal", battery: 74, status: "Warning", zone: "Zone B", lastUpdated: "10:41 AM", lora: "Connected", gps: "Available", map: { x: 48, y: 26 } },
  { id: "H004", miner: "Vikram Singh", temperature: 33.2, humidity: 68, methane: "Critical", methanePpm: 1250, airQuality: "Poor", aqi: 162, impact: "Normal", battery: 66, status: "Critical", zone: "Zone C", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 72, y: 36 } },
  { id: "H005", miner: "Priya Nair", temperature: 29.9, humidity: 59, methane: "Normal", methanePpm: 95, airQuality: "Good", aqi: 35, impact: "Normal", battery: 81, status: "Online", zone: "Zone B", lastUpdated: "10:40 AM", lora: "Connected", gps: "Available", map: { x: 54, y: 34 } },
  { id: "H006", miner: "Manoj Yadav", temperature: 31.1, humidity: 63, methane: "Normal", methanePpm: 130, airQuality: "Good", aqi: 47, impact: "Normal", battery: 58, status: "Online", zone: "Zone D", lastUpdated: "10:42 AM", lora: "Weak", gps: "Available", map: { x: 30, y: 72 } },
  { id: "H007", miner: "Deepak Kumar", temperature: 30.2, humidity: 60, methane: "Normal", methanePpm: 140, airQuality: "Good", aqi: 51, impact: "Normal", battery: 12, status: "Warning", zone: "Zone D", lastUpdated: "10:39 AM", lora: "Connected", gps: "Available", map: { x: 40, y: 78 } },
  { id: "H008", miner: "Anil Gupta", temperature: 32.0, humidity: 66, methane: "Warning", methanePpm: 620, airQuality: "Moderate", aqi: 96, impact: "Normal", battery: 70, status: "Warning", zone: "Zone C", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 80, y: 46 } },
  { id: "H009", miner: "Ravi Joshi", temperature: 0, humidity: 0, methane: "Normal", methanePpm: 0, airQuality: "Good", aqi: 0, impact: "Normal", battery: 0, status: "Offline", zone: "Zone E", lastUpdated: "09:58 AM", lora: "Disconnected", gps: "Unavailable", map: { x: 68, y: 76 } },
  { id: "H010", miner: "Kiran Desai", temperature: 30.5, humidity: 62, methane: "Normal", methanePpm: 105, airQuality: "Good", aqi: 40, impact: "Normal", battery: 95, status: "Online", zone: "Zone E", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 78, y: 70 } },
  { id: "H011", miner: "Sanjay Rao", temperature: 31.8, humidity: 65, methane: "Normal", methanePpm: 150, airQuality: "Good", aqi: 49, impact: "Normal", battery: 77, status: "Online", zone: "Zone A", lastUpdated: "10:41 AM", lora: "Connected", gps: "Available", map: { x: 14, y: 44 } },
  { id: "H012", miner: "Arjun Mehta", temperature: 32.4, humidity: 67, methane: "Normal", methanePpm: 160, airQuality: "Good", aqi: 55, impact: "Detected", battery: 63, status: "Critical", zone: "Zone B", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 44, y: 40 } },
];

export const summary = {
  activeMiners: 24,
  activeHelmets: 24,
  avgTemperature: 31.4,
  methane: "Normal",
  airQuality: "Good",
  activeAlerts: 2,
};

export type AlertCategory = "Critical" | "Warning" | "Information" | "Resolved";
export interface Alert {
  id: string;
  type: string;
  category: AlertCategory;
  helmetId: string;
  miner: string;
  zone: string;
  time: string;
  status: "Active" | "Acknowledged" | "Resolved";
}

export const alerts: Alert[] = [
  { id: "A1", type: "High methane detected", category: "Critical", helmetId: "H004", miner: "Vikram Singh", zone: "Zone C", time: "10:41 AM", status: "Active" },
  { id: "A2", type: "Impact detected", category: "Critical", helmetId: "H012", miner: "Arjun Mehta", zone: "Zone B", time: "10:38 AM", status: "Active" },
  { id: "A3", type: "Low battery", category: "Warning", helmetId: "H007", miner: "Deepak Kumar", zone: "Zone D", time: "10:35 AM", status: "Active" },
  { id: "A4", type: "High temperature", category: "Warning", helmetId: "H003", miner: "Suresh Patil", zone: "Zone B", time: "10:30 AM", status: "Acknowledged" },
  { id: "A5", type: "Helmet offline", category: "Warning", helmetId: "H009", miner: "Ravi Joshi", zone: "Zone E", time: "09:58 AM", status: "Active" },
  { id: "A6", type: "Methane rising", category: "Warning", helmetId: "H008", miner: "Anil Gupta", zone: "Zone C", time: "10:20 AM", status: "Active" },
  { id: "A7", type: "Shift B check-in complete", category: "Information", helmetId: "—", miner: "System", zone: "Entry Gate", time: "08:05 AM", status: "Active" },
  { id: "A8", type: "Weak LoRa signal", category: "Information", helmetId: "H006", miner: "Manoj Yadav", zone: "Zone D", time: "09:45 AM", status: "Active" },
  { id: "A9", type: "High temperature", category: "Resolved", helmetId: "H002", miner: "Amit Verma", zone: "Zone A", time: "07:52 AM", status: "Resolved" },
];

const hours = ["04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00"];
export function helmetHistory(id: string) {
  const h = helmets.find((x) => x.id === id) ?? helmets[0];
  const seed = parseInt(id.slice(1), 10) || 1;
  return hours.map((t, i) => {
    const w = Math.sin(i + seed) * 1.2;
    return {
      time: t,
      temperature: +(Math.max(h.temperature, 29) - 2 + i * 0.3 + w).toFixed(1),
      humidity: Math.round(Math.max(h.humidity, 58) - 4 + i * 0.6 + w * 2),
      methane: Math.round(Math.max(h.methanePpm, 90) * (0.6 + i * 0.06) + w * 10),
      aqi: Math.round(Math.max(h.aqi, 35) * (0.7 + i * 0.045) + w * 3),
    };
  });
}

export function helmetEvents(id: string) {
  const h = helmets.find((x) => x.id === id) ?? helmets[0];
  const ev = [
    { time: "08:02 AM", text: "Helmet connected", level: "info" },
    { time: "08:04 AM", text: "Attendance recorded (RFID)", level: "info" },
    { time: "08:15 AM", text: `Miner entered ${h.zone}`, level: "info" },
    { time: "09:30 AM", text: "Gas level checked — within limits", level: "ok" },
    { time: "10:12 AM", text: "Temperature increased", level: "warn" },
  ];
  if (h.impact === "Detected") ev.push({ time: "10:38 AM", text: "Impact detected", level: "crit" });
  if (h.methane === "Critical") ev.push({ time: "10:41 AM", text: "Methane above critical threshold", level: "crit" });
  return ev;
}

export const attendance = [
  { miner: "Rahul Sharma", helmetId: "H001", entry: "07:58 AM", exit: "—", status: "Present", zone: "Zone A" },
  { miner: "Amit Verma", helmetId: "H002", entry: "08:01 AM", exit: "—", status: "Present", zone: "Zone A" },
  { miner: "Suresh Patil", helmetId: "H003", entry: "08:22 AM", exit: "—", status: "Late", zone: "Zone B" },
  { miner: "Vikram Singh", helmetId: "H004", entry: "07:55 AM", exit: "—", status: "Present", zone: "Zone C" },
  { miner: "Priya Nair", helmetId: "H005", entry: "08:03 AM", exit: "—", status: "Present", zone: "Zone B" },
  { miner: "Manoj Yadav", helmetId: "H006", entry: "08:00 AM", exit: "—", status: "Present", zone: "Zone D" },
  { miner: "Deepak Kumar", helmetId: "H007", entry: "08:31 AM", exit: "—", status: "Late", zone: "Zone D" },
  { miner: "Anil Gupta", helmetId: "H008", entry: "07:59 AM", exit: "—", status: "Present", zone: "Zone C" },
  { miner: "Ravi Joshi", helmetId: "H009", entry: "07:50 AM", exit: "09:58 AM", status: "Present", zone: "Zone E" },
  { miner: "Kiran Desai", helmetId: "H010", entry: "08:02 AM", exit: "—", status: "Present", zone: "Zone E" },
  { miner: "Sanjay Rao", helmetId: "H011", entry: "08:04 AM", exit: "—", status: "Present", zone: "Zone A" },
  { miner: "Arjun Mehta", helmetId: "H012", entry: "08:00 AM", exit: "—", status: "Present", zone: "Zone B" },
  { miner: "Nitin Pawar", helmetId: "H013", entry: "—", exit: "—", status: "Absent", zone: "Zone C" },
  { miner: "Rohit Shinde", helmetId: "H014", entry: "—", exit: "—", status: "Absent", zone: "Zone D" },
];

export const cameras = [
  { id: "CAM-01", name: "Main Entrance" },
  { id: "CAM-02", name: "Tunnel A" },
  { id: "CAM-03", name: "Tunnel B" },
  { id: "CAM-04", name: "Emergency Exit" },
];

export type Range = "24h" | "7d" | "30d";
function series(n: number, label: (i: number) => string, base: Record<string, number>, amp: Record<string, number>) {
  return Array.from({ length: n }, (_, i) => {
    const row: Record<string, number | string> = { t: label(i) };
    for (const k of Object.keys(base)) row[k] = +(base[k] + Math.sin(i * 0.7 + k.length) * amp[k] + (i % 3) * amp[k] * 0.15).toFixed(1);
    return row;
  });
}
const labels: Record<Range, [number, (i: number) => string]> = {
  "24h": [24, (i) => `${String(i).padStart(2, "0")}:00`],
  "7d": [7, (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]],
  "30d": [30, (i) => `D${i + 1}`],
};
export function analytics(range: Range) {
  const [n, l] = labels[range];
  return {
    env: series(n, l, { temperature: 31, humidity: 63, methane: 180, aqi: 55 }, { temperature: 2.5, humidity: 5, methane: 60, aqi: 15 }),
    alerts: series(n, l, { critical: 1.5, warning: 3 }, { critical: 1.4, warning: 2 }).map((r) => ({ ...r, critical: Math.max(0, Math.round(r["critical"] as number)), warning: Math.max(0, Math.round(r["warning"] as number)) })),
    attendance: series(n, l, { present: 21, absent: 2, late: 1.5 }, { present: 2, absent: 1.2, late: 1.2 }).map((r) => ({ ...r, present: Math.round(r["present"] as number), absent: Math.max(0, Math.round(r["absent"] as number)), late: Math.max(0, Math.round(r["late"] as number)) })),
    battery: helmets.map((h) => ({ t: h.id, battery: h.battery })),
  };
}

export const components = ["ESP32", "MQ4", "MQ135", "MQ2", "DHT22", "MPU6050", "GPS", "LoRa", "RFID", "Battery"] as const;
export function helmetHealth(h: Helmet): Record<(typeof components)[number], string> {
  const off = h.status === "Offline";
  return {
    ESP32: off ? "Offline" : "Online",
    MQ4: off ? "Offline" : h.methane === "Critical" ? "Alert" : "Normal",
    MQ135: off ? "Offline" : h.airQuality === "Poor" ? "Alert" : "Normal",
    MQ2: off ? "Offline" : "Normal",
    DHT22: off ? "Offline" : "Online",
    MPU6050: off ? "Offline" : h.impact === "Detected" ? "Alert" : "Online",
    GPS: h.gps,
    LoRa: h.lora,
    RFID: off ? "Offline" : "Online",
    Battery: `${h.battery}%`,
  };
}
