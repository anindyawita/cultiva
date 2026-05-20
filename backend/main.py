from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Konfigurasi CORS agar frontend bisa akses backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan alamat frontend jika sudah production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
def read_hello():
    return {"message": "Hello from FastAPI!"}
