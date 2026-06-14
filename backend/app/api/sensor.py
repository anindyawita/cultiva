from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import List

router = APIRouter()
sensor_data: List[dict] = []

class SoilData(BaseModel):
    device_id:   str   = "esp32-soil-01"
    moisture:    float
    temperature: float
    ec:          int
    ph:          float
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
    if not sensor_data:
        return {"status": "no data"}
    return sensor_data[-1]

@router.get("/soil/history")
async def get_history():
    return sensor_data