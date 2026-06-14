"use client";
/**
 * SoilContext — Global store for IoT sensor data.
 *
 * Soil data dari SoilDashboard (real ESP atau dummy) disimpan di sini,
 * sehingga semua tab lain (PredictTab, MonitorTab, dll.) selalu
 * pakai angka yang SAMA dan konsisten.
 */
import { createContext, useContext, useState, ReactNode } from "react";

export interface SoilReading {
  moisture: number;
  temperature: number;
  ec: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  device_id: string;
  timestamp: string;
  connected: boolean; // true setelah "Check Device" berhasil
}

const DEFAULT: SoilReading = {
  moisture: 0,
  temperature: 0,
  ec: 0,
  ph: 0,
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0,
  device_id: "—",
  timestamp: new Date().toISOString(),
  connected: false,
};

interface SoilContextType {
  soil: SoilReading;
  setSoil: (data: SoilReading) => void;
}

const SoilContext = createContext<SoilContextType>({
  soil: DEFAULT,
  setSoil: () => {},
});

export function SoilProvider({ children }: { children: ReactNode }) {
  const [soil, setSoil] = useState<SoilReading>(DEFAULT);
  return (
    <SoilContext.Provider value={{ soil, setSoil }}>
      {children}
    </SoilContext.Provider>
  );
}

export function useSoil() {
  return useContext(SoilContext);
}
