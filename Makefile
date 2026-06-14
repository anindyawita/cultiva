# ============================================================
# Cultiva AI Platform — Makefile
# ============================================================
# Usage:
#   make setup    — install Python deps + copy .env
#   make run      — start FastAPI dev server (port 8000)
#   make frontend — start Next.js dev server (port 3000)
#   make worker   — start Celery worker (requires Redis)
#   make test     — run pytest
#   make lint     — run ruff linter
# ============================================================

PYTHON = python
VENV = backend/.venv
PIP = $(VENV)/Scripts/pip
UVICORN = $(VENV)/Scripts/uvicorn

.PHONY: setup run frontend worker test lint clean

# ── Setup ──────────────────────────────────────────────────

setup:
	@echo "🌱 Setting up Cultiva backend..."
	cd backend && $(PYTHON) -m venv .venv
	$(PIP) install --upgrade pip
	$(PIP) install -r backend/requirements.txt
	@if not exist backend\.env copy backend\.env.example backend\.env
	@echo "✅ Backend setup complete. Edit backend/.env with your API keys."
	@echo ""
	@echo "🌿 Setting up frontend..."
	cd frontend && npm install
	@echo "✅ Frontend setup complete."

# ── Backend ────────────────────────────────────────────────

run:
	@echo "🚀 Starting Cultiva API server on http://localhost:8000"
	cd backend && $(VENV)/Scripts/uvicorn main:app --reload --host 0.0.0.0 --port 8000

# ── Frontend ───────────────────────────────────────────────

frontend:
	@echo "🌐 Starting Cultiva frontend on http://localhost:3000"
	cd frontend && npm run dev

# ── Celery Worker ──────────────────────────────────────────

worker:
	@echo "⚙️  Starting Celery worker (requires Redis at localhost:6379)"
	cd backend && $(VENV)/Scripts/celery -A app.tasks.celery_app worker --loglevel=info

# ── Tests ──────────────────────────────────────────────────

test:
	cd backend && $(VENV)/Scripts/pytest tests/ -v

# ── Lint ───────────────────────────────────────────────────

lint:
	cd backend && $(VENV)/Scripts/ruff check app/

# ── Clean ──────────────────────────────────────────────────

clean:
	@echo "🗑️  Cleaning up..."
	rd /s /q backend\.venv 2>nul || true
	rd /s /q backend\rag_data 2>nul || true
	rd /s /q frontend\node_modules 2>nul || true
	rd /s /q frontend\.next 2>nul || true
