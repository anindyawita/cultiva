from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import sensor
from app.api.routes import router as routes_router

app = FastAPI(title="Cultiva Web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensor.router, prefix="/api/sensor", tags=["Sensor"])

app.include_router(routes_router, prefix="/api", tags=["Cultiva Features"])

@app.get("/")
def root():
    return {"message": "Cultiva Web API Running"}