"""
CultivaRAGPipeline — Main orchestrator for Retrieval-Augmented Generation.

Coordinates:
  1. Semantic retrieval from ChromaDB (pre-populated by preload_knowledge.py)
  2. LLM inference via any OpenAI-compatible API

NOTE: Scraping is NOT done at runtime.
Run `python preload_knowledge.py` once before starting the backend.

All .env values are read from app.core.config.settings — never hardcoded.
"""

import logging
from openai import OpenAI

from app.core.config import settings
from app.core.embedder import AgriEmbedder
# AgriWebScraper dipakai hanya di preload_knowledge.py, bukan di sini

logger = logging.getLogger(__name__)


# Feature → list of query templates for targeted scraping
FEATURE_QUERIES: dict[str, list[str]] = {
    "irrigation": [
        "{crop} water requirement per day irrigation",
        "{crop} evapotranspiration tropical climate",
        "{crop} irrigation schedule Indonesia",
    ],
    "fertilizer": [
        "{crop} NPK fertilizer recommendation Indonesia",
        "{crop} fertilizer dosage kg per hectare",
        "{crop} nitrogen phosphorus potassium requirement",
    ],
    "chatbot": [
        "{crop} general agronomy facts",
        "{crop} common diseases pests Indonesia",
    ],
    "monitoring": [
        "{crop} disease risk humid climate",
        "{crop} pest monitoring schedule Indonesia",
        "{crop} fungal disease prevention",
    ],
    "harvest": [
        "{crop} harvest days Indonesia tropical",
        "{crop} yield per hectare optimal conditions",
        "{crop} optimal harvest conditions indicators",
    ],
    "crop_recommendation": [
        "best crops tropical Indonesia rainy season",
        "crop suitability soil NPK Indonesia",
        "{crop} suitability tropical lowland",
    ],
    "farm_health": [
        "{crop} nutrient deficiency symptoms",
        "{crop} optimal NPK range growth stages",
        "{crop} disease risk high humidity",
    ],
}


class CultivaRAGPipeline:
    """
    RAG pipeline: retrieve from pre-populated ChromaDB → reason with LLM.
    """

    def __init__(self):
        self.embedder = AgriEmbedder()
        self._llm_client = None   # lazy-loaded on first call

    # ─────────────────────────────────────────────────────────────────────
    # LLM client (lazy singleton)
    # ─────────────────────────────────────────────────────────────────────

    @property
    def llm_client(self) -> OpenAI:
        if self._llm_client is None:
            self._llm_client = OpenAI(
                api_key=settings.llm_api_key,
                base_url=settings.llm_base_url,
            )
        return self._llm_client

    # ─────────────────────────────────────────────────────────────────────
    # Context retrieval
    # ─────────────────────────────────────────────────────────────────────

    def retrieve_context(
        self,
        crop_type: str,
        feature: str,
        extra_query: str = "",
        force_scrape: bool = False,  # kept for API compat, ignored at runtime
    ) -> str:
        """
        Retrieve relevant agricultural context from ChromaDB.

        ChromaDB must be pre-populated by running:
            python preload_knowledge.py

        No scraping happens here at runtime — only fast vector search.

        Args:
            crop_type: e.g. "Padi", "Jagung"
            feature: one of FEATURE_QUERIES keys
            extra_query: additional free-form query appended to retrieval
            force_scrape: ignored — scraping is offline only

        Returns:
            Concatenated context string (≤ 2 000 tokens ≈ 8 000 chars).
        """
        chunk_count = self.embedder.count_chunks_for_crop(crop_type)
        logger.info(
            "ChromaDB has %d chunks for crop='%s'", chunk_count, crop_type
        )

        if chunk_count == 0:
            logger.warning(
                "⚠️  Tidak ada data di ChromaDB untuk crop='%s'. "
                "Jalankan: python preload_knowledge.py",
                crop_type,
            )

        # Build retrieval query from feature + extra
        retrieval_query = f"{crop_type} {feature.replace('_', ' ')} {extra_query}".strip()
        chunks = self.embedder.semantic_search(
            query=retrieval_query,
            crop_type=crop_type,
            n_results=8,
        )

        if not chunks:
            # Fallback: search without crop_type filter
            logger.info("Fallback: searching ChromaDB tanpa filter crop_type")
            chunks = self.embedder.semantic_search(
                query=retrieval_query,
                n_results=5,
            )

        context = "\n\n---\n\n".join(chunks)
        # Truncate to ~8 000 chars (≈ 2 000 tokens)
        return context[:8000]

    # ─────────────────────────────────────────────────────────────────────
    # LLM generation
    # ─────────────────────────────────────────────────────────────────────

    def generate_recommendation(
        self,
        system_prompt: str,
        user_prompt: str,
        context: str,
    ) -> str:
        """
        Build messages and call the LLM.

        The context is injected into the system message so the model
        always reasons from retrieved knowledge.

        Args:
            system_prompt: Role/persona instructions.
            user_prompt: The user's specific question or request.
            context: Retrieved agricultural knowledge chunks.

        Returns:
            LLM response string.
        """
        full_system = (
            f"{system_prompt}\n\n"
            "=== RETRIEVED AGRICULTURAL KNOWLEDGE ===\n"
            f"{context if context else 'No specific context retrieved — use general agricultural knowledge.'}\n"
            "=== END OF CONTEXT ===\n\n"
            "Instructions: Always base your recommendations on the retrieved context above "
            "and the provided farm data. Respond in Bahasa Indonesia when the user's input "
            "is in Bahasa Indonesia, otherwise respond in English. "
            "Be specific, actionable, and explain your reasoning."
        )

        try:
            response = self.llm_client.chat.completions.create(
                model=settings.llm_model,
                messages=[
                    {"role": "system", "content": full_system},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.4,
                max_tokens=1500,
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:
            logger.error("LLM call failed: %s", exc)
            return (
                "Maaf, sistem AI sedang tidak tersedia. "
                "Silakan coba beberapa saat lagi. "
                f"(Error: {type(exc).__name__})"
            )

    # ─────────────────────────────────────────────────────────────────────
    # NOTE: _scrape_and_store telah dipindahkan ke preload_knowledge.py
    # Scraping hanya dilakukan sekali secara offline, bukan saat runtime.
    # Lihat: backend/preload_knowledge.py
    # ─────────────────────────────────────────────────────────────────────
