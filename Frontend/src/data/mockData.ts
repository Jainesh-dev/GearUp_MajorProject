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
    { id: "H001", miner: "Helmet 1", temperature: 31.4, humidity: 64, methane: "Normal", methanePpm: 120, airQuality: "Good", aqi: 42, impact: "Normal", battery: 87, status: "Online", zone: "Zone A", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 18, y: 30 } },
    { id: "H002", miner: "Helmet 2", temperature: 30.8, humidity: 61, methane: "Normal", methanePpm: 110, airQuality: "Good", aqi: 38, impact: "Normal", battery: 92, status: "Online", zone: "Zone A", lastUpdated: "10:42 AM", lora: "Connected", gps: "Available", map: { x: 26, y: 38 } },
    { id: "H003", miner: "Helmet 3", temperature: 38.6, humidity: 70, methane: "Normal", methanePpm: 180, airQuality: "Moderate", aqi: 88, impact: "Normal", battery: 74, status: "Warning", zone: "Zone B", lastUpdated: "10:41 AM", lora: "Connected", gps: "Available", map: { x: 48, y: 26 } },
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
    { id: "A4", type: "High temperature", category: "Warning", helmetId: "H003", miner: "Helmet 3", zone: "Zone B", time: "10:30 AM", status: "Acknowledged" },
    { id: "A5", type: "Helmet offline", category: "Warning", helmetId: "H009", miner: "Ravi Joshi", zone: "Zone E", time: "09:58 AM", status: "Active" },
    { id: "A6", type: "Methane rising", category: "Warning", helmetId: "H008", miner: "Anil Gupta", zone: "Zone C", time: "10:20 AM", status: "Active" },
    { id: "A7", type: "Shift B check-in complete", category: "Information", helmetId: "—", miner: "System", zone: "Entry Gate", time: "08:05 AM", status: "Active" },
    { id: "A8", type: "Weak LoRa signal", category: "Information", helmetId: "H006", miner: "Manoj Yadav", zone: "Zone D", time: "09:45 AM", status: "Active" },
    { id: "A9", type: "High temperature", category: "Resolved", helmetId: "H002", miner: "Helmet 2", zone: "Zone A", time: "07:52 AM", status: "Resolved" },
  ];

  const hours = ["04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00"];
  export function helmetHistory(id: string) {
    const h = helmets.find((x) => x.id === id) ?? helmets[0]!;
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
    const h = helmets.find((x) => x.id === id) ?? helmets[0]!;
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
    { miner: "Helmet 1", helmetId: "H001", entry: "07:58 AM", exit: "—", status: "Present", zone: "Zone A" },
    { miner: "Helmet 2", helmetId: "H002", entry: "08:01 AM", exit: "—", status: "Present", zone: "Zone A" },
    { miner: "Helmet 3", helmetId: "H003", entry: "08:22 AM", exit: "—", status: "Late", zone: "Zone B" },
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
      for (const k of Object.keys(base)) row[k] = +(base[k]! + Math.sin(i * 0.7 + k.length) * amp[k]! + (i % 3) * amp[k]! * 0.15).toFixed(1);
      return row;
    });
  }
  const labels: Record<Range, [number, (i: number) => string]> = {
    "24h": [24, (i) => `${String(i).padStart(2, "0")}:00`],
    "7d": [7, (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]!],
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

  // ---------------- v2: safety gear, mesh network, health ----------------
  export type GearKey = "helmet" | "vest" | "boots" | "gloves" | "goggles" | "respirator";
  export const gearLabels: Record<GearKey, string> = {
    helmet: "Smart Helmet", vest: "Safety Vest", boots: "Safety Boots", gloves: "Gloves", goggles: "Safety Goggles", respirator: "Respirator",
  };
  const missingGear: Record<string, GearKey[]> = { H002: ["goggles"], H006: ["gloves"], H008: ["respirator", "goggles"], H012: ["vest"] };
  const nodeOf: Record<string, string> = { "Zone A": "NODE-01", "Zone B": "NODE-02", "Zone C": "NODE-03", "Zone D": "NODE-04", "Zone E": "NODE-05" };

  export interface MinerDetail {
    safetyGear: Record<GearKey, boolean>;
    gearSummary: { label: string; level: "complete" | "missing" | "critical" };
    gearActivity: { time: string; text: string }[];
    sensors: { esp32: string; mq4: string; mq135: string; mq2: string; dht: string; mpu6050: string; rfid: string };
    network: { lora: string; meshNode: string; signal: number; connection: "Stable" | "Weak" | "Lost" };
    maintenance: string;
  }

  export function minerDetail(h: Helmet): MinerDetail {
    const off = h.status === "Offline";
    const miss = missingGear[h.id] ?? [];
    const safetyGear = Object.fromEntries((Object.keys(gearLabels) as GearKey[]).map((k) => [k, k === "helmet" ? !off : !miss.includes(k)])) as Record<GearKey, boolean>;
    const critical = miss.includes("respirator") || miss.includes("vest") || off;
    const gearSummary = miss.length === 0 && !off
      ? { label: "Complete", level: "complete" as const }
      : critical ? { label: off ? "Helmet Offline" : "Critical Missing", level: "critical" as const }
      : { label: `${miss.length} Missing`, level: "missing" as const };
    const gearActivity = (Object.keys(gearLabels) as GearKey[]).filter((k) => safetyGear[k]).slice(0, 4)
      .map((k, i) => ({ time: `08:${String(10 - i * 2).padStart(2, "0")} AM`, text: `${gearLabels[k]} detected` }));
    miss.forEach((k) => gearActivity.unshift({ time: "08:12 AM", text: `${gearLabels[k]} not detected` }));
    const hh = helmetHealth(h);
    return {
      safetyGear, gearSummary, gearActivity,
      sensors: { esp32: hh.ESP32, mq4: hh.MQ4, mq135: hh.MQ135, mq2: hh.MQ2, dht: hh.DHT22, mpu6050: hh.MPU6050, rfid: hh.RFID },
      network: {
        lora: h.lora, meshNode: nodeOf[h.zone] ?? "NODE-01",
        signal: off ? 0 : h.lora === "Weak" ? 54 : 88 + (parseInt(h.id.slice(1)) % 10),
        connection: off ? "Lost" : h.lora === "Weak" ? "Weak" : "Stable",
      },
      maintenance: `${(parseInt(h.id.slice(1)) % 20) + 2} Sep 2026`,
    };
  }

  export type Overall = "Healthy" | "Warning" | "Critical" | "Offline";
  export function overallHealth(h: Helmet): Overall {
    if (h.status === "Offline") return "Offline";
    const v = Object.values(helmetHealth(h));
    if (v.includes("Alert") || h.battery < 20) return h.battery < 20 ? "Warning" : "Critical";
    if (v.includes("Weak") || h.battery < 40) return "Warning";
    return "Healthy";
  }

  export const homeSummary = {
    activeMiners: 24,
    helmetsOnline: 22,
    helmetsTotal: 24,
    mineSafety: "SAFE" as "SAFE" | "CAUTION" | "DANGER",
    mineSafetyNote: "No critical threats",
    alerts: { total: 2, warning: 1, critical: 1 },
    network: { name: "Mesh Network", connected: 98 },
    sos: "NO ACTIVE SOS",
    indicators: [
      { label: "Temperature", value: "Normal" },
      { label: "Gas Level", value: "Normal" },
      { label: "Air Quality", value: "Good" },
      { label: "Impact Events", value: "0" },
      { label: "Network", value: "Stable" },
    ],
  };

  export const homeAlerts = [
    { level: "Critical", title: "High Gas Level", helmetId: "H004", zone: "Zone B", time: "10:42 AM" },
    { level: "Warning", title: "Low Helmet Battery", helmetId: "H007", zone: "Zone A", time: "10:38 AM" },
    { level: "Information", title: "Helmet Connected", helmetId: "H012", zone: "Zone C", time: "10:31 AM" },
  ];

  export const zoneStatus = [
    { zone: "Zone A", status: "Safe" }, { zone: "Zone B", status: "Warning" }, { zone: "Zone C", status: "Safe" }, { zone: "Zone D", status: "Safe" },
  ];

  export const recentActivity = [
    { time: "10:42 AM", text: "H004 entered Zone B" },
    { time: "10:38 AM", text: "H007 battery dropped below 20%" },
    { time: "10:31 AM", text: "H012 connected to network" },
    { time: "10:25 AM", text: "Miner attendance recorded" },
  ];

  export interface MeshNode { id: string; zone: string; status: "Online" | "Weak" | "Offline"; helmets: number; signal: number; x: number; y: number }
  export const gateway = { id: "GATEWAY", x: 50, y: 14 };
  export const meshNodes: MeshNode[] = [
    { id: "NODE-01", zone: "Zone A", status: "Online", helmets: 8, signal: 96, x: 18, y: 46 },
    { id: "NODE-02", zone: "Zone B", status: "Online", helmets: 6, signal: 92, x: 50, y: 46 },
    { id: "NODE-03", zone: "Zone C", status: "Weak", helmets: 5, signal: 61, x: 82, y: 46 },
    { id: "NODE-04", zone: "Zone D", status: "Online", helmets: 3, signal: 89, x: 34, y: 80 },
    { id: "NODE-05", zone: "Zone E", status: "Offline", helmets: 2, signal: 0, x: 70, y: 80 },
  ];
  export const meshLinks: [string, string][] = [
    ["GATEWAY", "NODE-02"], ["GATEWAY", "NODE-01"], ["GATEWAY", "NODE-03"],
    ["NODE-01", "NODE-02"], ["NODE-02", "NODE-03"], ["NODE-01", "NODE-04"], ["NODE-02", "NODE-04"], ["NODE-03", "NODE-05"], ["NODE-04", "NODE-05"],
  ];

  export const sosEvent = { helmetId: "H004", miner: "Helmet 1", zone: "Zone B", time: "10:43 AM" };

  export const cameraMeta: Record<string, { status: "Online" | "Offline"; lastUpdate: string }> = {
    "CAM-01": { status: "Online", lastUpdate: "10:42 AM" },
    "CAM-02": { status: "Online", lastUpdate: "10:42 AM" },
    "CAM-03": { status: "Online", lastUpdate: "10:41 AM" },
    "CAM-04": { status: "Offline", lastUpdate: "09:15 AM" },
  };

  export const shifts = ["Shift A (06:00–14:00)", "Shift B (08:00–16:00)", "Shift C (14:00–22:00)"];

  export function batteryTrend(h: Helmet) {
    return hours.map((t, i) => ({ time: t, battery: Math.max(0, Math.min(100, Math.round(h.battery + (hours.length - 1 - i) * 3))) }));
  }
  export function connectionHistory(h: Helmet) {
    if (h.status === "Offline") return [{ time: "09:58 AM", text: "Connection lost" }, { time: "09:40 AM", text: "Signal weak" }, { time: "08:02 AM", text: "Connected to mesh" }];
    return [{ time: h.lastUpdated, text: "Last data transmission" }, { time: "09:10 AM", text: "Handover between mesh nodes" }, { time: "08:02 AM", text: "Connected to mesh" }];
  }
