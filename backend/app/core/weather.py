"""
WeatherService — Wraps the OpenWeatherMap API.

Provides:
  - Current weather for a city/location string
  - 5-day / 3-hour forecast aggregated to daily summaries
  - Hargreaves-Samani simplified evapotranspiration (ET₀) estimate

API key is read from settings.weather_api_key (set in .env).
"""

import logging
import math
from datetime import datetime
from collections import defaultdict

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)

OWM_BASE = "https://api.openweathermap.org/data/2.5"


class WeatherService:
    """OpenWeatherMap wrapper for current + forecast weather data."""

    def __init__(self):
        self.api_key = settings.weather_api_key

    # ─────────────────────────────────────────────────────────────────────
    # Current weather
    # ─────────────────────────────────────────────────────────────────────

    def get_current_weather(self, location: str) -> dict:
        """
        Fetch current weather conditions for *location*.

        Args:
            location: City name or "City,CountryCode" (e.g. "Malang,ID")

        Returns:
            {
              "location": str,
              "temp_celsius": float,
              "feels_like": float,
              "humidity_pct": int,
              "rainfall_mm": float,       # last 1h if available
              "wind_speed_ms": float,
              "weather_description": str,
              "icon": str,
            }
        """
        try:
            resp = requests.get(
                f"{OWM_BASE}/weather",
                params={
                    "q": location,
                    "appid": self.api_key,
                    "units": "metric",
                },
                timeout=8,
            )
            resp.raise_for_status()
            data = resp.json()

            return {
                "location": data.get("name", location),
                "temp_celsius": round(data["main"]["temp"], 1),
                "feels_like": round(data["main"]["feels_like"], 1),
                "humidity_pct": data["main"]["humidity"],
                "rainfall_mm": data.get("rain", {}).get("1h", 0.0),
                "wind_speed_ms": data.get("wind", {}).get("speed", 0.0),
                "weather_description": data["weather"][0]["description"].capitalize(),
                "icon": data["weather"][0]["icon"],
            }
        except Exception as exc:
            logger.warning("Current weather fetch failed for '%s': %s", location, exc)
            return self._fallback_weather(location)

    # ─────────────────────────────────────────────────────────────────────
    # 7-day forecast (OWM free plan gives 5 days/3h intervals)
    # ─────────────────────────────────────────────────────────────────────

    def get_7day_forecast(self, location: str) -> list[dict]:
        """
        Fetch and aggregate the OWM 5-day/3-hour forecast into daily summaries.

        Args:
            location: City name or "City,CountryCode"

        Returns:
            List of up to 7 dicts:
            {
              "date": "YYYY-MM-DD",
              "temp_max": float,
              "temp_min": float,
              "humidity": int,    # average
              "rainfall_mm": float,
              "description": str,
            }
        """
        try:
            resp = requests.get(
                f"{OWM_BASE}/forecast",
                params={
                    "q": location,
                    "appid": self.api_key,
                    "units": "metric",
                },
                timeout=8,
            )
            resp.raise_for_status()
            data = resp.json()

            # Group 3-hour slots by date
            by_date: dict[str, list[dict]] = defaultdict(list)
            for item in data.get("list", []):
                date_str = item["dt_txt"][:10]
                by_date[date_str].append(item)

            daily: list[dict] = []
            for date_str in sorted(by_date.keys()):
                slots = by_date[date_str]
                temps = [s["main"]["temp"] for s in slots]
                humidities = [s["main"]["humidity"] for s in slots]
                rain_total = sum(s.get("rain", {}).get("3h", 0) for s in slots)
                main_desc = slots[len(slots) // 2]["weather"][0]["description"].capitalize()

                daily.append({
                    "date": date_str,
                    "temp_max": round(max(temps), 1),
                    "temp_min": round(min(temps), 1),
                    "humidity": round(sum(humidities) / len(humidities)),
                    "rainfall_mm": round(rain_total, 1),
                    "description": main_desc,
                })

            return daily[:7]

        except Exception as exc:
            logger.warning("Forecast fetch failed for '%s': %s", location, exc)
            return self._fallback_forecast()

    # ─────────────────────────────────────────────────────────────────────
    # Evapotranspiration estimate (Hargreaves-Samani simplified)
    # ─────────────────────────────────────────────────────────────────────

    def estimate_evapotranspiration(self, temp: float, humidity: float) -> float:
        """
        Simplified Hargreaves-Samani ET₀ estimate (mm/day).

        Formula used: ET₀ ≈ 0.0023 × (T + 17.8) × (0.408 × Ra)
        Ra (extraterrestrial radiation) approximated from temp range.

        For full accuracy, use FAO Penman-Monteith with solar radiation data.

        Args:
            temp: Mean air temperature (°C)
            humidity: Relative humidity (%)

        Returns:
            ET₀ in mm/day
        """
        # Approximate daily temp range from humidity (rough heuristic)
        temp_range = max(5.0, 25.0 - (humidity - 50) * 0.2)
        # Ra ≈ extraterrestrial radiation proxy (latitude-averaged tropical)
        ra = 15.0  # MJ/m²/day (tropical midpoint)

        et0 = 0.0023 * (temp + 17.8) * math.sqrt(temp_range) * 0.408 * ra
        return round(max(0.0, et0), 2)

    # ─────────────────────────────────────────────────────────────────────
    # Fallbacks (used when API is unavailable)
    # ─────────────────────────────────────────────────────────────────────

    def _fallback_weather(self, location: str) -> dict:
        return {
            "location": location,
            "temp_celsius": 28.0,
            "feels_like": 30.0,
            "humidity_pct": 75,
            "rainfall_mm": 0.0,
            "wind_speed_ms": 2.5,
            "weather_description": "Data tidak tersedia",
            "icon": "01d",
        }

    def _fallback_forecast(self) -> list[dict]:
        from datetime import timedelta
        today = datetime.now()
        return [
            {
                "date": (today + timedelta(days=i)).strftime("%Y-%m-%d"),
                "temp_max": 30.0,
                "temp_min": 24.0,
                "humidity": 75,
                "rainfall_mm": 0.0,
                "description": "Data tidak tersedia",
            }
            for i in range(5)
        ]
