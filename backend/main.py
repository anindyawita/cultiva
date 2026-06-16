from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from app.api import sensor, routes
=======
from app.api import sensor
from app.api.routes import router as routes_router
>>>>>>> 43b6369a04a4ee3011b8874ffb4ea18c804f396c

app = FastAPI(title="Cultiva Web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensor.router, prefix="/api/sensor", tags=["Sensor"])
app.include_router(routes.router, prefix="/api", tags=["Features"])

app.include_router(routes_router, prefix="/api", tags=["Cultiva Features"])

@app.get("/")
def root():
    return {"message": "Cultiva Web API Running"}