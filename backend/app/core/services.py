"""
Feature services for all 7 Cultiva AI features.

Each service function:
  1. Calls WeatherService to enrich data
  2. Calls CultivaRAGPipeline.retrieve_context() for relevant knowledge
  3. Builds a structured LLM prompt
  4. Parses and returns a typed response dict

All services are stateless functions — dependency injection happens at the API layer.
"""

import json
import logging
import re
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder

import os

from datetime import datetime, timedelta, date
from typing import Optional

from app.core.pipeline import CultivaRAGPipeline
from app.core.weather import WeatherService

logger = logging.getLogger(__name__)

# Module-level singletons (one pipeline + one weather client per worker)
_pipeline: Optional[CultivaRAGPipeline] = None
_weather: Optional[WeatherService] = None


def get_pipeline() -> CultivaRAGPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = CultivaRAGPipeline()
    return _pipeline


def get_weather() -> WeatherService:
    global _weather
    if _weather is None:
        _weather = WeatherService()
    return _weather


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────

def _safe_parse_json(text: str, fallback: dict) -> dict:
    """Try to extract the first JSON object from *text*, else return *fallback*."""
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return fallback


def _days_since(planted_date_str: str) -> int:
    """Return days elapsed since *planted_date_str* (YYYY-MM-DD)."""
    try:
        planted = datetime.strptime(planted_date_str, "%Y-%m-%d").date()
        return (date.today() - planted).days
    except Exception:
        return 0


def _growth_stage_from_days(crop_type: str, days: int) -> str:
    """Heuristically determine growth stage from days since planting."""
    thresholds = {
        "padi":      (14, 45, 80),
        "jagung":    (10, 35, 65),
        "cabai":     (14, 40, 70),
        "tomat":     (14, 35, 60),
        "singkong":  (20, 60, 120),
        "kedelai":   (10, 30, 55),
        "default":   (14, 40, 70),
    }
    t = thresholds.get(crop_type.lower(), thresholds["default"])
    if days < t[0]:
        return "seeding"
    elif days < t[1]:
        return "vegetative"
    elif days < t[2]:
        return "flowering"
    else:
        return "harvest"


# ─────────────────────────────────────────────────────────────────────────────
# Feature 1 — Irrigation Scheduling
# ─────────────────────────────────────────────────────────────────────────────

def irrigation_service(
    crop_type: str,
    location: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    current_date: Optional[str] = None,
) -> dict:
    """Generate a 7-day irrigation schedule with LLM reasoning."""

    pipeline = get_pipeline()
    weather_svc = get_weather()

    current_weather = weather_svc.get_current_weather(location)
    forecast = weather_svc.get_7day_forecast(location)
    et0 = weather_svc.estimate_evapotranspiration(
        current_weather["temp_celsius"],
        current_weather["humidity_pct"],
    )

    context = pipeline.retrieve_context(crop_type, "irrigation")

    system_prompt = (
        "Kamu adalah pakar irigasi pertanian yang berpengalaman. "
        "Gunakan data cuaca, ET₀, NPK, dan pengetahuan pertanian yang diberikan "
        "untuk membuat jadwal irigasi presisi selama 7 hari. "
        "Selalu jelaskan alasan setiap rekomendasi secara ilmiah."
    )

    forecast_str = json.dumps(forecast, ensure_ascii=False, indent=2)
    user_prompt = (
        f"Tanaman: {crop_type}\n"
        f"Lokasi: {location}\n"
        f"NPK saat ini: N={nitrogen}, P={phosphorus}, K={potassium}\n"
        f"Suhu saat ini: {current_weather['temp_celsius']}°C, " 
        f"Kelembaban: {current_weather['humidity_pct']}%\n"
        f"Curah hujan saat ini: {current_weather['rainfall_mm']} mm\n"
        f"ET₀ estimasi: {et0} mm/hari\n"
        f"Prakiraan 7 hari:\n{forecast_str}\n\n"
        "Buat jadwal irigasi dalam format JSON:\n"
        '{"water_stress_level": "low|medium|high", '
        '"weekly_schedule": [{"day": "...", "action": "Irrigate|Skip", '
        '"amount_mm": number_or_null, "reason": "..."}], '
        '"ai_reasoning": "..."}'
    )

    llm_response = pipeline.generate_recommendation(system_prompt, user_prompt, context)
    parsed = _safe_parse_json(llm_response, {})

    return {
        "crop_type": crop_type,
        "location": location,
        "current_weather": current_weather,
        "et0_mm_per_day": et0,
        "water_stress_level": parsed.get("water_stress_level", "medium"),
        "weekly_schedule": parsed.get("weekly_schedule", []),
        "ai_reasoning": parsed.get("ai_reasoning", llm_response),
        "sources_used": _extract_sources(context),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Feature 2 — Fertilizer Recommendation
# ─────────────────────────────────────────────────────────────────────────────

def fertilizer_service(
    crop_type: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    location: str,
    growth_phase: str,
) -> dict:
    """Recommend fertilizer type, dosage, and timing based on NPK analysis."""

    pipeline = get_pipeline()
    weather_svc = get_weather()

    current_weather = weather_svc.get_current_weather(location)
    context = pipeline.retrieve_context(
        crop_type, "fertilizer",
        extra_query=f"{growth_phase} NPK requirement"
    )

    system_prompt = (
        "Kamu adalah agronomist pupuk berpengalaman. "
        "Analisis status NPK tanaman dan rekomendasikan pupuk yang tepat "
        "berdasarkan fase pertumbuhan, kondisi cuaca, dan kebutuhan tanaman. "
        "Hindari rekomendasi pupuk berlebih yang bisa merusak tanaman atau lingkungan."
    )

    user_prompt = (
        f"Tanaman: {crop_type}\n"
        f"Fase pertumbuhan: {growth_phase}\n"
        f"NPK saat ini: N={nitrogen}, P={phosphorus}, K={potassium}\n"
        f"Suhu: {temperature}°C, Kelembaban: {current_weather['humidity_pct']}%\n"
        f"Lokasi: {location}\n\n"
        "Berikan rekomendasi pupuk dalam format JSON:\n"
        '{"npk_analysis": {"nitrogen_status": "deficient|optimal|excess", '
        '"phosphorus_status": "...", "potassium_status": "..."}, '
        '"recommendation": {"fertilizer": "...", "dosage_kg_per_ha": number, '
        '"timing": "...", "method": "..."}, '
        '"warnings": ["..."], "ai_reasoning": "..."}'
    )

    llm_response = pipeline.generate_recommendation(system_prompt, user_prompt, context)
    parsed = _safe_parse_json(llm_response, {})

    return {
        "crop_type": crop_type,
        "growth_phase": growth_phase,
        "npk_input": {"N": nitrogen, "P": phosphorus, "K": potassium},
        "npk_analysis": parsed.get("npk_analysis", {}),
        "recommendation": parsed.get("recommendation", {}),
        "warnings": parsed.get("warnings", []),
        "ai_reasoning": parsed.get("ai_reasoning", llm_response),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Feature 3 — AI Chatbot (stateless; session history managed externally)
# ─────────────────────────────────────────────────────────────────────────────

def chatbot_service(
    message: str,
    crop_type: Optional[str],
    session_id: str,
    conversation_history: list[dict],
    nitrogen: Optional[float] = None,
    phosphorus: Optional[float] = None,
    potassium: Optional[float] = None,
) -> dict:
    """
    Answer a user message using RAG context + conversation history.

    Args:
        conversation_history: List of {"role": "user"|"assistant", "content": str}
    """

    pipeline = get_pipeline()

    # RAG retrieval on the user message
    context = pipeline.retrieve_context(
        crop_type or "general", "chatbot",
        extra_query=message,
    )

    system_prompt = (
        "Kamu adalah Cultiva AI, asisten pertanian cerdas. "
        "Bantu petani dengan saran yang praktis, berbasis data, dan mudah dipahami. "
        "Jika ada data NPK atau jenis tanaman, gunakan itu dalam jawabanmu. "
        "Selalu bersikap ramah dan suportif."
    )

    # Build multi-turn prompt
    history_str = ""
    for msg in conversation_history[-6:]:   # last 3 turns
        role = "Pengguna" if msg["role"] == "user" else "Cultiva AI"
        history_str += f"{role}: {msg['content']}\n"

    farm_ctx = ""
    if crop_type:
        farm_ctx += f"Jenis tanaman: {crop_type}\n"
    if nitrogen is not None:
        farm_ctx += f"NPK: N={nitrogen}, P={phosphorus}, K={potassium}\n"

    user_prompt = (
        f"{farm_ctx}"
        f"Riwayat percakapan:\n{history_str}\n"
        f"Pertanyaan: {message}"
    )

    reply = pipeline.generate_recommendation(system_prompt, user_prompt, context)

    # Suggest follow-ups based on crop type
    follow_ups = _generate_follow_ups(crop_type)

    return {
        "session_id": session_id,
        "reply": reply,
        "sources": _extract_sources(context),
        "follow_up_suggestions": follow_ups,
    }


def _generate_follow_ups(crop_type: Optional[str]) -> list[str]:
    base = ["Cek jadwal irigasi", "Lihat prediksi panen", "Rekomendasi pupuk"]
    if crop_type:
        base.insert(0, f"Status kesehatan {crop_type}")
    return base[:3]


# ─────────────────────────────────────────────────────────────────────────────
# Feature 4 — Monitoring Scheduling
# ─────────────────────────────────────────────────────────────────────────────

def monitoring_service(
    crop_type: str,
    location: str,
    planted_date: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
) -> dict:
    """Generate a disease/pest monitoring schedule based on growth stage + weather."""

    pipeline = get_pipeline()
    weather_svc = get_weather()

    current_weather = weather_svc.get_current_weather(location)
    forecast = weather_svc.get_7day_forecast(location)

    days_planted = _days_since(planted_date)
    growth_stage = _growth_stage_from_days(crop_type, days_planted)

    context = pipeline.retrieve_context(
        crop_type, "monitoring",
        extra_query=f"disease {growth_stage} humid Indonesia"
    )

    system_prompt = (
        "Kamu adalah pakar perlindungan tanaman dan monitoring pertanian. "
        "Buat jadwal monitoring penyakit dan hama berdasarkan fase pertumbuhan, "
        "kondisi cuaca (terutama kelembaban), dan risiko spesifik tanaman. "
        "Rekomendasikan tindakan preventif yang konkret dan terukur."
    )

    forecast_summary = [
        f"{d['date']}: {d['temp_max']}/{d['temp_min']}°C, "
        f"Hujan {d['rainfall_mm']}mm, Kelembaban {d['humidity']}%"
        for d in forecast[:5]
    ]

    user_prompt = (
        f"Tanaman: {crop_type}\n"
        f"Lokasi: {location}\n"
        f"Tanggal tanam: {planted_date} ({days_planted} hari lalu)\n"
        f"Fase pertumbuhan saat ini: {growth_stage}\n"
        f"NPK: N={nitrogen}, P={phosphorus}, K={potassium}\n"
        f"Suhu: {temperature}°C, Kelembaban: {current_weather['humidity_pct']}%\n"
        f"Prakiraan cuaca:\n" + "\n".join(forecast_summary) + "\n\n"
        "Buat jadwal monitoring dalam format JSON:\n"
        '{"risk_level": "low|medium|high", '
        '"monitoring_schedule": [{"day": "YYYY-MM-DD", "check_for": ["..."], '
        '"reason": "...", "action": "..."}], '
        '"preventive_recommendation": "...", "ai_reasoning": "..."}'
    )

    llm_response = pipeline.generate_recommendation(system_prompt, user_prompt, context)
    parsed = _safe_parse_json(llm_response, {})

    return {
        "crop_type": crop_type,
        "current_growth_stage": growth_stage,
        "days_since_planted": days_planted,
        "risk_level": parsed.get("risk_level", "medium"),
        "monitoring_schedule": parsed.get("monitoring_schedule", []),
        "preventive_recommendation": parsed.get("preventive_recommendation", ""),
        "ai_reasoning": parsed.get("ai_reasoning", llm_response),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Feature 5 — Harvest Forecasting
# ─────────────────────────────────────────────────────────────────────────────

def harvest_service(
    crop_type: str,
    planted_date: str,
    location: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
) -> dict:
    """Estimate harvest window and yield range using RAG + LLM."""

    pipeline = get_pipeline()
    weather_svc = get_weather()

    current_weather = weather_svc.get_current_weather(location)
    days_planted = _days_since(planted_date)

    context = pipeline.retrieve_context(
        crop_type, "harvest",
        extra_query="harvest days yield per hectare Indonesia"
    )

    system_prompt = (
        "Kamu adalah pakar agronomi prediksi panen. "
        "Estimasikan jendela panen dan proyeksi hasil berdasarkan data NPK, cuaca, "
        "dan hari tanam. Jangan klaim akurasi deterministik — framing sebagai estimasi kontekstual. "
        "Identifikasi faktor risiko yang dapat memengaruhi hasil panen."
    )

    user_prompt = (
        f"Tanaman: {crop_type}\n"
        f"Tanggal tanam: {planted_date} ({days_planted} hari lalu)\n"
        f"Lokasi: {location}\n"
        f"NPK: N={nitrogen}, P={phosphorus}, K={potassium}\n"
        f"Suhu rata-rata: {temperature}°C\n"
        f"Kelembaban saat ini: {current_weather['humidity_pct']}%\n\n"
        "Berikan prediksi panen dalam format JSON:\n"
        '{"estimated_harvest_window": {"earliest": "YYYY-MM-DD", "latest": "YYYY-MM-DD", "optimal": "YYYY-MM-DD"}, '
        '"yield_estimate": {"range_kg_per_ha": "X - Y", "confidence": "low|moderate|high", '
        '"limiting_factors": ["..."]}, '
        '"ai_reasoning": "..."}'
    )

    llm_response = pipeline.generate_recommendation(system_prompt, user_prompt, context)
    parsed = _safe_parse_json(llm_response, {})

    return {
        "crop_type": crop_type,
        "planted_date": planted_date,
        "days_since_planted": days_planted,
        "estimated_harvest_window": parsed.get("estimated_harvest_window", {}),
        "yield_estimate": parsed.get("yield_estimate", {}),
        "ai_reasoning": parsed.get("ai_reasoning", llm_response),
        "sources": _extract_sources(context),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Feature 6 — Crop Recommendation
# ─────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model_crop_recommendation.pkl")
LE_PATH = os.path.join(BASE_DIR, "models", "label_encoder.pkl")

_ml_model = None

def _load_crop_model():
    global _ml_model
    if _ml_model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"File model tidak ditemukan di: {MODEL_PATH}")
        _ml_model = joblib.load(MODEL_PATH)
    return _ml_model

_label_encoder = None

def _load_label_encoder():
    global _label_encoder
    if _label_encoder is None:
        if not os.path.exists(LE_PATH):
            raise FileNotFoundError(f"File label encoder tidak ditemukan di: {LE_PATH}")
        _label_encoder = joblib.load(LE_PATH)
    return _label_encoder

def crop_recommendation_service(
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        temperature: float,
        humidity: float,
        ph: float,
        soil_type: str,
        season: str,
        location: str,
        rainfall_mm: Optional[float] = None,
) -> dict:
    
    model = _load_crop_model()

    label_encoder = _load_label_encoder()

    input_data = {
        'soil_type': [soil_type],
        'season': [season],
        'pH': [ph],             
        'temperature': [temperature],
        'humidity': [humidity],
        'n': [nitrogen],         
        'p': [phosphorus],        
        'k': [potassium]
    }

    df_input = pd.DataFrame(input_data)

    prediction = model.predict(df_input)

    crop_name = label_encoder.inverse_transform(prediction)[0]

    return {
        "recommended_crop" : crop_name,
        "input_params": {
            "soil_type": soil_type,
            "season": season,
            "pH": ph,
            "temperature": temperature,
            "humidity": humidity,
            "n": nitrogen,
            "p": phosphorus,
            "k": potassium
        },
        "message": "Prediksi sukses diproses"
    }

# def crop_recommendation_service(
#     nitrogen: float,
#     phosphorus: float,
#     potassium: float,
#     temperature: float,
#     location: str,
#     rainfall_mm: Optional[float] = None,
# ) -> dict:
#     """Rank top 5 crops suitable for the given soil + weather conditions."""

#     pipeline = get_pipeline()
#     weather_svc = get_weather()

#     current_weather = weather_svc.get_current_weather(location)
#     rainfall = rainfall_mm or current_weather.get("rainfall_mm", 0.0)

#     context = pipeline.retrieve_context(
#         "general", "crop_recommendation",
#         extra_query=f"best crops {location} NPK {nitrogen} {phosphorus} {potassium}"
#     )

#     system_prompt = (
#         "Kamu adalah pakar agronomi rekomendasi tanaman. "
#         "Berdasarkan parameter tanah (NPK), suhu, curah hujan, dan lokasi, "
#         "rekomendasikan 5 tanaman terbaik yang paling cocok untuk kondisi tersebut. "
#         "Berikan skor kesesuaian 0-100 dengan penjelasan ilmiah."
#     )

#     user_prompt = (
#         f"Lokasi: {location}\n"
#         f"NPK tanah: N={nitrogen}, P={phosphorus}, K={potassium}\n"
#         f"Suhu: {temperature}°C\n"
#         f"Kelembaban: {current_weather['humidity_pct']}%\n"
#         f"Curah hujan: {rainfall} mm\n\n"
#         "Rekomendasikan 5 tanaman terbaik dalam format JSON:\n"
#         '{"top_recommendations": ['
#         '{"crop": "...", "suitability_score": number, "reason": "...", '
#         '"expected_yield": "...", "harvest_days": "..."}], '
#         '"environmental_summary": "...", "ai_reasoning": "..."}'
#     )

#     llm_response = pipeline.generate_recommendation(system_prompt, user_prompt, context)
#     parsed = _safe_parse_json(llm_response, {})

#     return {
#         "input_params": {
#             "N": nitrogen, "P": phosphorus, "K": potassium,
#             "temperature": temperature, "location": location,
#             "rainfall_mm": rainfall,
#         },
#         "top_recommendations": parsed.get("top_recommendations", []),
#         "environmental_summary": parsed.get("environmental_summary", ""),
#         "ai_reasoning": parsed.get("ai_reasoning", llm_response),
#     }


# ─────────────────────────────────────────────────────────────────────────────
# Feature 7 — Farm Health Monitoring
# ─────────────────────────────────────────────────────────────────────────────

def farm_health_service(
    crop_type: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    location: str,
    planted_date: str,
) -> dict:
    """Calculate a 0–100 farm health score with breakdown and LLM explanation."""

    pipeline = get_pipeline()
    weather_svc = get_weather()

    current_weather = weather_svc.get_current_weather(location)
    days_planted = _days_since(planted_date)
    growth_stage = _growth_stage_from_days(crop_type, days_planted)

    context = pipeline.retrieve_context(
        crop_type, "farm_health",
        extra_query="nutrient deficiency optimal NPK disease risk"
    )

    # Heuristic pre-scores (LLM will refine these)
    nutrient_score = _compute_nutrient_score(nitrogen, phosphorus, potassium)
    weather_score = _compute_weather_score(
        current_weather["temp_celsius"], current_weather["humidity_pct"]
    )
    disease_risk_score = _compute_disease_risk_score(
        current_weather["humidity_pct"], growth_stage
    )
    overall = round((nutrient_score * 0.4 + weather_score * 0.3 + disease_risk_score * 0.3))

    system_prompt = (
        "Kamu adalah pakar kesehatan lahan pertanian. "
        "Jelaskan skor kesehatan tanaman berdasarkan data NPK, cuaca, dan fase pertumbuhan. "
        "Identifikasi peringatan dan buat daftar tindakan preventif yang spesifik."
    )

    user_prompt = (
        f"Tanaman: {crop_type}\n"
        f"Fase pertumbuhan: {growth_stage} ({days_planted} hari)\n"
        f"NPK: N={nitrogen}, P={phosphorus}, K={potassium}\n"
        f"Suhu: {temperature}°C, Kelembaban: {current_weather['humidity_pct']}%\n"
        f"Skor heuristik: Nutrisi={nutrient_score}, Cuaca={weather_score}, "
        f"Risiko Penyakit={disease_risk_score}, Total={overall}\n\n"
        "Berikan analisis kesehatan lahan dalam format JSON:\n"
        '{"overall_health_score": number, "breakdown": {"nutrient_score": number, '
        '"weather_score": number, "disease_risk_score": number}, '
        '"status": "Healthy|Warning|Critical", "warnings": ["..."], '
        '"recommendations": ["..."], "ai_reasoning": "..."}'
    )

    llm_response = pipeline.generate_recommendation(system_prompt, user_prompt, context)
    parsed = _safe_parse_json(llm_response, {})

    return {
        "crop_type": crop_type,
        "overall_health_score": parsed.get("overall_health_score", overall),
        "breakdown": parsed.get("breakdown", {
            "nutrient_score": nutrient_score,
            "weather_score": weather_score,
            "disease_risk_score": disease_risk_score,
        }),
        "status": parsed.get("status", "Healthy" if overall >= 70 else "Warning"),
        "warnings": parsed.get("warnings", []),
        "recommendations": parsed.get("recommendations", []),
        "ai_reasoning": parsed.get("ai_reasoning", llm_response),
        "growth_stage": growth_stage,
        "days_since_planted": days_planted,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Internal scoring helpers
# ─────────────────────────────────────────────────────────────────────────────

def _compute_nutrient_score(n: float, p: float, k: float) -> int:
    """Simple heuristic: optimal ranges N=60-120, P=20-60, K=30-80."""
    def score_val(val, lo, hi):
        if lo <= val <= hi:
            return 100
        elif val < lo:
            return max(0, int(100 - (lo - val) * 1.5))
        else:
            return max(0, int(100 - (val - hi) * 1.2))

    return round((score_val(n, 60, 120) + score_val(p, 20, 60) + score_val(k, 30, 80)) / 3)


def _compute_weather_score(temp: float, humidity: int) -> int:
    """Optimal for tropical crops: temp 22–32°C, humidity 60–85%."""
    temp_score = 100 if 22 <= temp <= 32 else max(0, 100 - abs(temp - 27) * 5)
    hum_score = 100 if 60 <= humidity <= 85 else max(0, 100 - abs(humidity - 72) * 2)
    return round((temp_score + hum_score) / 2)


def _compute_disease_risk_score(humidity: int, growth_stage: str) -> int:
    """Higher humidity + flowering stage = higher disease risk (lower score)."""
    base = 100
    if humidity > 85:
        base -= 30
    elif humidity > 75:
        base -= 15
    if growth_stage in ("flowering", "harvest"):
        base -= 10
    return max(0, base)


def _extract_sources(context: str) -> list[str]:
    """
    Attempt to extract URL-like strings from the context text.
    Returns a de-duplicated list (max 5).
    """
    import re
    urls = re.findall(r"https?://[^\s]+", context)
    seen = []
    for u in urls:
        clean = u.rstrip(".,;)")
        if clean not in seen:
            seen.append(clean)
    return seen[:5]
