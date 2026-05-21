# Frontend Next.js

## Cara Menjalankan

1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```

## Integrasi dengan Backend

- Pastikan backend FastAPI sudah berjalan di http://localhost:8000
- Frontend otomatis fetch ke backend lewat variabel environment `NEXT_PUBLIC_API_URL` yang sudah diatur di `.env.local`
