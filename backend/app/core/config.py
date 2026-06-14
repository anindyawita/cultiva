"""
Cultiva AI Platform — Application Configuration
Loads settings from environment variables via python-dotenv.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ── LLM ──────────────────────────────────────────────────────────────
    llm_api_key: str = "your_llm_api_key_here"
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"

    # ── Weather ───────────────────────────────────────────────────────────
    weather_api_key: str = "your_openweathermap_key_here"

    # ── Database ──────────────────────────────────────────────────────────
    database_url: str = "postgresql://user:password@localhost:5432/cultiva_db"

    # ── Redis ─────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── App ───────────────────────────────────────────────────────────────
    secret_key: str = "change_this_in_production"
    debug: bool = True
    allowed_hosts: str = "localhost,127.0.0.1"

    # ── ChromaDB ──────────────────────────────────────────────────────────
    chroma_persist_dir: str = "./rag_data/chroma_db"
    chroma_collection_name: str = "cultiva_agri_knowledge"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()
