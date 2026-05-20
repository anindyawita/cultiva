# Backend FastAPI

## Cara Menjalankan

1. Aktifkan virtual environment:
   - Windows: `backend\.venv\Scripts\activate`
   - Mac/Linux: `source backend/.venv/bin/activate`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Jalankan server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Struktur Folder

- main.py (entrypoint utama)
- requirements.txt
- .env.example
- app/ (struktur lanjutan, misal: api, models, schemas, core)
- tests/
