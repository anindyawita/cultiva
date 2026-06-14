"use client";
import { useEffect, useState } from "react";

interface SoilData {
  moisture: number;
  temperature: number;
  ec: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  device_id: string;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Card = ({ label, value, unit, color, note }: any) => (
  <div style={{
    padding: "16px", borderRadius: "12px",
    background: "#f9fafb", border: `2px solid ${color}20`,
    flex: "1 1 140px"
  }}>
    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{label}</p>
    <p style={{ margin: "4px 0", fontSize: "28px", fontWeight: "bold", color }}>
      {value}<span style={{ fontSize: "14px" }}> {unit}</span>
    </p>
    {note && <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{note}</p>}
  </div>
);

export default function SoilDashboard() {
  const [data, setData]       = useState<SoilData | null>(null);
  const [status, setStatus]   = useState("Loading...");

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sensor/soil/latest`);
      const d   = await res.json();
      setData(d);
      setStatus("Connected");
    } catch {
      setStatus("Disconnected");
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>🌱 Soil Monitor</h2>
        <span style={{
          padding: "4px 12px", borderRadius: "999px", fontSize: "12px",
          background: status === "Connected" ? "#dcfce7" : "#fee2e2",
          color:      status === "Connected" ? "#166534" : "#991b1b",
        }}>● {status}</span>
      </div>

      {data && (
        <>
          {/* Row 1: Moisture, Temp, pH, EC */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "20px" }}>
            <Card label="💧 Moisture"    value={data?.moisture?.toFixed(1) ?? "0.0"}   unit="%"      color="#3b82f6"
              note={data.moisture < 30 ? "⚠️ Kering" : data.moisture < 60 ? "✅ Sedang" : "💚 Optimal"} />
            <Card label="🌡️ Temperature" value={data?.temperature?.toFixed(1) ?? "0.0"} unit="°C"     color="#f59e0b"
              note={data.temperature > 35 ? "🔥 Terlalu panas" : "✅ Normal"} />
            <Card label="🧪 pH"          value={data?.ph?.toFixed(1) ?? "0.0"}           unit=""       color="#8b5cf6"
              note={data.ph < 6 ? "⚠️ Asam" : data.ph > 7.5 ? "⚠️ Basa" : "✅ Netral"} />
            <Card label="⚡ EC"          value={data.ec}                      unit="µS/cm"  color="#06b6d4"
              note="Konduktivitas tanah" />
          </div>

          {/* Row 2: NPK */}
          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "14px", color: "#6b7280" }}>
            🌿 Nutrisi Tanah (mg/kg)
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <Card label="🟢 Nitrogen (N)"    value={data.nitrogen}    unit="mg/kg" color="#22c55e"
              note={data.nitrogen < 50 ? "⚠️ Rendah" : data.nitrogen < 150 ? "✅ Cukup" : "💚 Tinggi"} />
            <Card label="🟠 Fosfor (P)"      value={data.phosphorus}  unit="mg/kg" color="#f97316"
              note={data.phosphorus < 25 ? "⚠️ Rendah" : "✅ Cukup"} />
            <Card label="🟣 Kalium (K)"      value={data.potassium}   unit="mg/kg" color="#a855f7"
              note={data.potassium < 100 ? "⚠️ Rendah" : "✅ Cukup"} />
          </div>

          <p style={{ marginTop: "20px", fontSize: "11px", color: "#d1d5db", textAlign: "right" }}>
            Device: {data.device_id} | Update: {new Date(data.timestamp).toLocaleString("id-ID")}
          </p>
        </>
      )}

      {!data && status !== "Loading..." && (
        <p style={{ marginTop: "40px", textAlign: "center", color: "#9ca3af" }}>
          Belum ada data dari sensor
        </p>
      )}
    </div>
  );
}