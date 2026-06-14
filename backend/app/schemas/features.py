"""
Pydantic schemas (request + response) for all Cultiva API features.
All responses use the standard envelope: {"success": bool, "data": ..., "message": str}
"""

from pydantic import BaseModel, Field
from typing import Optional, Any


# ─────────────────────────────────────────────────────────────────────────────
# Standard API envelope
# ─────────────────────────────────────────────────────────────────────────────

class APIResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# Feature 1 — Irrigation Scheduling
# ─────────────────────────────────────────────────────────────────────────────

class IrrigationRequest(BaseModel):
    crop_type: str = Field(..., examples=["Padi"])
    location: str = Field(..., examples=["Malang,ID"])
    nitrogen: float = Field(..., ge=0, le=500, alias="N")
    phosphorus: float = Field(..., ge=0, le=500, alias="P")
    potassium: float = Field(..., ge=0, le=500, alias="K")
    temperature: float = Field(..., examples=[28.0])
    current_date: Optional[str] = None   # YYYY-MM-DD; defaults to today

    class Config:
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# Feature 2 — Fertilizer Recommendation
# ─────────────────────────────────────────────────────────────────────────────

class FertilizerRequest(BaseModel):
    crop_type: str = Field(..., examples=["Jagung"])
    nitrogen: float = Field(..., ge=0, le=500, alias="N")
    phosphorus: float = Field(..., ge=0, le=500, alias="P")
    potassium: float = Field(..., ge=0, le=500, alias="K")
    temperature: float = Field(..., examples=[27.0])
    location: str = Field(..., examples=["Malang,ID"])
    growth_phase: str = Field(
        ...,
        examples=["vegetative"],
        description="seeding | vegetative | flowering | harvest",
    )

    class Config:
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# Feature 3 — AI Chatbot
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    crop_type: Optional[str] = None
    session_id: str = Field(..., examples=["abc-123"])
    nitrogen: Optional[float] = Field(None, alias="N")
    phosphorus: Optional[float] = Field(None, alias="P")
    potassium: Optional[float] = Field(None, alias="K")

    class Config:
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# Feature 4 — Monitoring Scheduling
# ─────────────────────────────────────────────────────────────────────────────

class MonitoringRequest(BaseModel):
    crop_type: str = Field(..., examples=["Cabai"])
    location: str = Field(..., examples=["Malang,ID"])
    planted_date: str = Field(..., examples=["2025-04-01"])
    nitrogen: float = Field(..., ge=0, le=500, alias="N")
    phosphorus: float = Field(..., ge=0, le=500, alias="P")
    potassium: float = Field(..., ge=0, le=500, alias="K")
    temperature: float = Field(..., examples=[28.0])

    class Config:
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# Feature 5 — Harvest Forecasting
# ─────────────────────────────────────────────────────────────────────────────

class HarvestRequest(BaseModel):
    crop_type: str = Field(..., examples=["Padi"])
    planted_date: str = Field(..., examples=["2025-03-15"])
    location: str = Field(..., examples=["Malang,ID"])
    nitrogen: float = Field(..., ge=0, le=500, alias="N")
    phosphorus: float = Field(..., ge=0, le=500, alias="P")
    potassium: float = Field(..., ge=0, le=500, alias="K")
    temperature: float = Field(..., examples=[28.0])

    class Config:
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# Feature 6 — Crop Recommendation
# ─────────────────────────────────────────────────────────────────────────────

class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=500, alias="N")
    phosphorus: float = Field(..., ge=0, le=500, alias="P")
    potassium: float = Field(..., ge=0, le=500, alias="K")
    temperature: float = Field(..., examples=[28.0])
    location: str = Field(..., examples=["Malang,ID"])
    rainfall_mm: Optional[float] = Field(None, ge=0)

    class Config:
        populate_by_name = True


# ─────────────────────────────────────────────────────────────────────────────
# Feature 7 — Farm Health Monitoring
# ─────────────────────────────────────────────────────────────────────────────

class FarmHealthRequest(BaseModel):
    crop_type: str = Field(..., examples=["Tomat"])
    nitrogen: float = Field(..., ge=0, le=500, alias="N")
    phosphorus: float = Field(..., ge=0, le=500, alias="P")
    potassium: float = Field(..., ge=0, le=500, alias="K")
    temperature: float = Field(..., examples=[27.0])
    location: str = Field(..., examples=["Malang,ID"])
    planted_date: str = Field(..., examples=["2025-04-01"])

    class Config:
        populate_by_name = True
