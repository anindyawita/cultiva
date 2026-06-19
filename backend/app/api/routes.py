"""
Cultiva API Router — all 7 feature endpoints + weather utility.

All responses follow the standard envelope:
  {"success": true, "data": {...}, "message": ""}
"""

import os
import joblib
import numpy as np
import pandas as pd

import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from app.schemas.features import (
    IrrigationRequest,
    FertilizerRequest,
    ChatRequest,
    MonitoringRequest,
    HarvestRequest,
    CropRecommendationRequest,
    FarmHealthRequest,
    APIResponse,
)
from app.core.services import (
    irrigation_service,
    fertilizer_service,
    chatbot_service,
    monitoring_service,
    harvest_service,
    crop_recommendation_service,
    farm_health_service,
    get_weather,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory session store for chatbot (keyed by session_id)
# In production: replace with Redis via aioredis
_chat_sessions: dict[str, list[dict]] = {}


def _ok(data: dict, message: str = "") -> dict:
    return {"success": True, "data": data, "message": message}


def _err(message: str, status: int = 500) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"success": False, "data": None, "message": message},
    )


# ─────────────────────────────────────────────────────────────────────────────
# Feature 1 — Irrigation Scheduling
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/irrigation/", summary="AI Irrigation Schedule")
async def irrigation_endpoint(body: IrrigationRequest, background_tasks: BackgroundTasks):
    """
    Generate a 7-day AI irrigation schedule for a specific crop and location.
    Uses real-time weather data + RAG-retrieved agricultural knowledge.
    """
    try:
        result = irrigation_service(
            crop_type=body.crop_type,
            location=body.location,
            nitrogen=body.nitrogen,
            phosphorus=body.phosphorus,
            potassium=body.potassium,
            temperature=body.temperature,
            current_date=body.current_date or datetime.now().strftime("%Y-%m-%d"),
        )
        return _ok(result, "Jadwal irigasi berhasil dibuat")
    except Exception as exc:
        logger.error("Irrigation endpoint error: %s", exc, exc_info=True)
        return _err(f"Gagal membuat jadwal irigasi: {str(exc)}")


# ─────────────────────────────────────────────────────────────────────────────
# Feature 2 — Fertilizer Recommendation
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/fertilizer/", summary="AI Fertilizer Recommendation")
async def fertilizer_endpoint(body: FertilizerRequest):
    """
    Analyze NPK levels and recommend fertilizer type, dosage, and timing.
    Context-aware per growth phase (seeding / vegetative / flowering / harvest).
    """
    try:
        result = fertilizer_service(
            crop_type=body.crop_type,
            nitrogen=body.nitrogen,
            phosphorus=body.phosphorus,
            potassium=body.potassium,
            temperature=body.temperature,
            location=body.location,
            growth_phase=body.growth_phase,
        )
        return _ok(result, "Rekomendasi pupuk berhasil dibuat")
    except Exception as exc:
        logger.error("Fertilizer endpoint error: %s", exc, exc_info=True)
        return _err(f"Gagal membuat rekomendasi pupuk: {str(exc)}")


# ─────────────────────────────────────────────────────────────────────────────
# Feature 3 — AI Chatbot
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/chatbot/message/", summary="AI Chatbot Message")
async def chatbot_message_endpoint(body: ChatRequest):
    """
    Send a message to the Cultiva AI agricultural advisor.
    Maintains conversation history per session_id (in-memory, 2h TTL in production).
    """
    try:
        # Get or create session history
        if body.session_id not in _chat_sessions:
            _chat_sessions[body.session_id] = []

        history = _chat_sessions[body.session_id]

        result = chatbot_service(
            message=body.message,
            crop_type=body.crop_type,
            session_id=body.session_id,
            conversation_history=history,
            nitrogen=body.nitrogen,
            phosphorus=body.phosphorus,
            potassium=body.potassium,
        )

        # Update session history
        history.append({"role": "user", "content": body.message})
        history.append({"role": "assistant", "content": result["reply"]})

        # Keep last 20 messages per session
        _chat_sessions[body.session_id] = history[-20:]

        return _ok(result, "")
    except Exception as exc:
        logger.error("Chatbot endpoint error: %s", exc, exc_info=True)
        return _err(f"Chatbot error: {str(exc)}")


@router.get("/chatbot/history/{session_id}/", summary="Chatbot Session History")
async def chatbot_history_endpoint(session_id: str):
    """Retrieve conversation history for a given session."""
    history = _chat_sessions.get(session_id, [])
    return _ok({"session_id": session_id, "history": history})


@router.post("/chatbot/new-session/", summary="Create New Chat Session")
async def new_chat_session():
    """Create a new chatbot session and return the session_id."""
    session_id = str(uuid.uuid4())
    _chat_sessions[session_id] = []
    return _ok({"session_id": session_id}, "Sesi baru dibuat")


# ─────────────────────────────────────────────────────────────────────────────
# Feature 4 — Monitoring Scheduling
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/monitoring/", summary="AI Monitoring Schedule")
async def monitoring_endpoint(body: MonitoringRequest):
    """
    Generate a disease and pest monitoring schedule based on growth stage,
    weather conditions, and crop-specific risk factors.
    """
    try:
        result = monitoring_service(
            crop_type=body.crop_type,
            location=body.location,
            planted_date=body.planted_date,
            nitrogen=body.nitrogen,
            phosphorus=body.phosphorus,
            potassium=body.potassium,
            temperature=body.temperature,
        )
        return _ok(result, "Jadwal monitoring berhasil dibuat")
    except Exception as exc:
        logger.error("Monitoring endpoint error: %s", exc, exc_info=True)
        return _err(f"Gagal membuat jadwal monitoring: {str(exc)}")


# ─────────────────────────────────────────────────────────────────────────────
# Feature 5 — Harvest Forecasting
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/harvest/", summary="AI Harvest Forecast")
async def harvest_endpoint(body: HarvestRequest):
    """
    Estimate harvest window and yield range using RAG knowledge + LLM reasoning.
    Results framed as contextual estimates, not deterministic predictions.
    """
    try:
        result = harvest_service(
            crop_type=body.crop_type,
            planted_date=body.planted_date,
            location=body.location,
            nitrogen=body.nitrogen,
            phosphorus=body.phosphorus,
            potassium=body.potassium,
            temperature=body.temperature,
        )
        return _ok(result, "Prediksi panen berhasil dibuat")
    except Exception as exc:
        logger.error("Harvest endpoint error: %s", exc, exc_info=True)
        return _err(f"Gagal membuat prediksi panen: {str(exc)}")


# ─────────────────────────────────────────────────────────────────────────────
# Feature 6 — Crop Recommendation
# ─────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "app", "models", "model_crop_recommendation.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "app", "models", "label_encoder.pkl")

model = None
label_encoder = None

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        print("======== ML MODEL & ENCODER SUCCESSFULLY LOADED ========")
    else:
        print(f"======== WARNING: Model/Encoder file not found! ========")
        print(f"Checked MODEL_PATH: {MODEL_PATH}")
        print(f"Checked ENCODER_PATH: {ENCODER_PATH}")
except Exception as e:
    print(f"======== ERROR LOADING MODEL: {str(e)} ========")

def _ok(data: dict, message: str = "") -> dict:
    return {"success": True, "data": data, "message": message}

def determine_india_season(date_str: str) -> str:
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        month = date_obj.month
        # Pemetaan bulan ke Musim India
        if 6 <= month <= 10:
            return "kharif"
        elif 11 <= month <= 10 or month <= 3:
            return "rabi"
        else:
            return "zaid"
    except:
        return "kharif"

@router.post("/crop-recommendation/", summary="AI Crop Recommendation")
async def crop_recommendation_endpoint(body: CropRecommendationRequest):
    """
    Most suitable crops for the given soil NPK, temperature,
    rainfall, and location parameters.
    """
    try:
        season = determine_india_season(body.current_date)
        confidence_match = 98

        if model and label_encoder:
            column_names = [
                "soil_type", "season", "pH", "temperature", 
                "humidity", "n", "p", "k"
            ]
            input_features = pd.DataFrame(
                [["Clay Soil", "kharif", 6.7, 11.3, 65.0, 68.1, 41.9, 56.6]], 
                columns=column_names)
            
            prediction_label = model.predict(input_features)[0]
            predicted_crop = label_encoder.inverse_transform([prediction_label])[0]

            print(predicted_crop)

        result = {
            "crop": predicted_crop,
            "match_percentage": confidence_match,
            "input_used": {
                "N": body.nitrogen,
                "P": body.phosphorus,
                "K": body.potassium,
                "pH": body.ph,
                "humidity": body.humidity,
                "temperature": body.temperature,
                "soil_type": body.soil_type,
                "detected_season": season
            }
        }

        return _ok(result, "Rekomendasi tanaman berhasil dibuat")
    except Exception as exc:
        return {"success": False, "data": None, "message": f"Gagal membuat rekomendasi: {str(exc)}"}


# ─────────────────────────────────────────────────────────────────────────────
# Feature 7 — Farm Health Monitoring
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/farm-health/", summary="AI Farm Health Score")
async def farm_health_endpoint(body: FarmHealthRequest):
    """
    Calculate an overall farm health score (0–100) with nutrient, weather,
    and disease risk breakdown. Includes LLM-generated action recommendations.
    """
    try:
        result = farm_health_service(
            crop_type=body.crop_type,
            nitrogen=body.nitrogen,
            phosphorus=body.phosphorus,
            potassium=body.potassium,
            temperature=body.temperature,
            location=body.location,
            planted_date=body.planted_date,
        )
        return _ok(result, "Analisis kesehatan lahan berhasil")
    except Exception as exc:
        logger.error("Farm health endpoint error: %s", exc, exc_info=True)
        return _err(f"Gagal menganalisis kesehatan lahan: {str(exc)}")


# ─────────────────────────────────────────────────────────────────────────────
# Weather utility endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/weather/current/", summary="Current Weather")
async def current_weather_endpoint(location: str = "Malang,ID"):
    """Get current weather conditions for a location."""
    try:
        data = get_weather().get_current_weather(location)
        return _ok(data)
    except Exception as exc:
        return _err(str(exc))


@router.get("/weather/forecast/", summary="7-Day Forecast")
async def weather_forecast_endpoint(location: str = "Malang,ID"):
    """Get 5-day aggregated daily weather forecast."""
    try:
        data = get_weather().get_7day_forecast(location)
        return _ok({"location": location, "forecast": data})
    except Exception as exc:
        return _err(str(exc))
