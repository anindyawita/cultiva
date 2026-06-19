from fastapi import APIRouter
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
import random

router = APIRouter()
sensor_data: List[dict] = []

BASE_SELANGOR_SENSOR_DATA = {
    "device_id": "esp32-soil-01",
    "moisture": 72.5,
    "temperature": 29.8,
    "ec": 680,
    "ph": 5.2,
    "nitrogen": 95,
    "phosphorus": 28,
    "potassium": 85
}

BASE_SURABAYA_SENSOR_DATA = {
    "device_id": "esp32-soil-01",
    "moisture": 58.0,
    "temperature": 31.2,
    "ec": 920,
    "ph": 6.6,
    "nitrogen": 120,
    "phosphorus": 55,
    "potassium": 135
}

class SoilData(BaseModel):
    device_id:   str   = "esp32-soil-01"
    moisture:    float = Field(..., ge=0, le=100, description="Persentase kelembapan 0-100")
    temperature: float
    ec:          int
    ph:          float = Field(..., ge=0, le=14, description="Skala pH 0-14")
    nitrogen:    int
    phosphorus:  int
    potassium:   int

@router.post("/soil", status_code=201)
async def receive_soil_data(data: SoilData):
    record = {**data.dict(), "timestamp": datetime.now().isoformat()}
    sensor_data.append(record)
    if len(sensor_data) > 100:
        sensor_data.pop(0)
    return {"status": "ok", "data": record}

@router.get("/soil/latest")
async def get_latest():
    def fluctuate(value, min_val, max_val, is_int=False):
        change = value * random.uniform(-0.05, 0.05)
        new_val = value + change
        new_val = max(min_val, min(max_val, new_val))
        return int(round(new_val)) if is_int else round(new_val, 1)

    dummy_record = {
        "device_id": BASE_SELANGOR_SENSOR_DATA["device_id"],
        "moisture": fluctuate(BASE_SELANGOR_SENSOR_DATA["moisture"], 0, 100),
        "temperature": fluctuate(BASE_SELANGOR_SENSOR_DATA["temperature"], 10, 50),
        "ec": fluctuate(BASE_SELANGOR_SENSOR_DATA["ec"], 100, 1000, is_int=True),
        "ph": fluctuate(BASE_SELANGOR_SENSOR_DATA["ph"], 0, 14),
        "nitrogen": fluctuate(BASE_SELANGOR_SENSOR_DATA["nitrogen"], 0, 150, is_int=True),
        "phosphorus": fluctuate(BASE_SELANGOR_SENSOR_DATA["phosphorus"], 0, 100, is_int=True),
        "potassium": fluctuate(BASE_SELANGOR_SENSOR_DATA["potassium"], 0, 100, is_int=True),
        "timestamp": datetime.now().isoformat()
    }
    return dummy_record
    # if not sensor_data:
    #     return {"status": "no data"}
    # return sensor_data[-1]

@router.get("/soil/history")
async def get_history():
    return sensor_data