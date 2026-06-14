/**
 * Cultiva API Client
 *
 * Typed wrapper around all Cultiva backend endpoints.
 * Base URL reads from NEXT_PUBLIC_API_URL env (default: http://localhost:8000)
 *
 * Usage:
 *   import { cultivaApi } from '@/lib/api';
 *   const result = await cultivaApi.cropRecommendation({ N: 85, P: 40, K: 48, ... });
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// Generic request helper
// ─────────────────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "API error");
  }
  const json = await res.json();
  return json.data as T;
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(res.statusText);
  const json = await res.json();
  return json.data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface IrrigationInput {
  crop_type: string;
  location: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  current_date?: string;
}

export interface FertilizerInput {
  crop_type: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  location: string;
  growth_phase: "seeding" | "vegetative" | "flowering" | "harvest";
}

export interface ChatInput {
  message: string;
  crop_type?: string;
  session_id: string;
  N?: number;
  P?: number;
  K?: number;
}

export interface MonitoringInput {
  crop_type: string;
  location: string;
  planted_date: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
}

export interface HarvestInput {
  crop_type: string;
  planted_date: string;
  location: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
}

export interface CropRecommendationInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  location: string;
  rainfall_mm?: number;
}

export interface FarmHealthInput {
  crop_type: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  location: string;
  planted_date: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────────────────────────────────────

export const cultivaApi = {
  /** Feature 1: AI irrigation schedule */
  irrigation: (input: IrrigationInput) =>
    post("/api/irrigation/", input as unknown as Record<string, unknown>),

  /** Feature 2: Fertilizer recommendation */
  fertilizer: (input: FertilizerInput) =>
    post("/api/fertilizer/", input as unknown as Record<string, unknown>),

  /** Feature 3: Chat with AI advisor */
  chat: (input: ChatInput) =>
    post("/api/chatbot/message/", input as unknown as Record<string, unknown>),

  /** Feature 3: Get chat history */
  chatHistory: (sessionId: string) =>
    get(`/api/chatbot/history/${sessionId}/`),

  /** Feature 3: Create new chat session */
  newChatSession: () =>
    post<{ session_id: string }>("/api/chatbot/new-session/", {}),

  /** Feature 4: Monitoring schedule */
  monitoring: (input: MonitoringInput) =>
    post("/api/monitoring/", input as unknown as Record<string, unknown>),

  /** Feature 5: Harvest forecast */
  harvest: (input: HarvestInput) =>
    post("/api/harvest/", input as unknown as Record<string, unknown>),

  /** Feature 6: Crop recommendation */
  cropRecommendation: (input: CropRecommendationInput) =>
    post("/api/crop-recommendation/", input as unknown as Record<string, unknown>),

  /** Feature 7: Farm health score */
  farmHealth: (input: FarmHealthInput) =>
    post("/api/farm-health/", input as unknown as Record<string, unknown>),

  /** Weather: current conditions */
  currentWeather: (location: string) =>
    get("/api/weather/current/", { location }),

  /** Weather: 5-day forecast */
  weatherForecast: (location: string) =>
    get("/api/weather/forecast/", { location }),
};
