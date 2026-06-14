"""
AgriEmbedder — Manages embedding generation and ChromaDB storage.

Uses sentence-transformers (all-MiniLM-L6-v2) for local embedding and
chromadb.PersistentClient for durable vector storage. Thread-safe singleton
pattern so only one SentenceTransformer model is loaded per process.
"""

import logging
import hashlib
from datetime import datetime, timezone
from typing import Optional

from sentence_transformers import SentenceTransformer
import chromadb

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Module-level singleton (loaded once at import time) ───────────────────────
_model: Optional[SentenceTransformer] = None
_chroma_client: Optional[chromadb.PersistentClient] = None
_collection = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info("Loading SentenceTransformer model (all-MiniLM-L6-v2)…")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _get_client():
    global _chroma_client
    if _chroma_client is None:
        import os
        os.makedirs(settings.chroma_persist_dir, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
        )
    return _chroma_client


def _get_collection():
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


# ─────────────────────────────────────────────────────────────────────────────


class AgriEmbedder:
    """
    Handles text chunking, embedding, and ChromaDB CRUD for agricultural docs.
    """

    def __init__(self):
        self.model = _get_model()
        self.collection = _get_collection()

    # ─────────────────────────────────────────────────────────────────────
    # Text chunking
    # ─────────────────────────────────────────────────────────────────────

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
        """
        Split *text* into overlapping word-level chunks.

        Args:
            text: Source text to chunk.
            chunk_size: Maximum number of words per chunk.
            overlap: Number of words shared between consecutive chunks.

        Returns:
            List of text chunks.
        """
        words = text.split()
        chunks: list[str] = []
        step = max(1, chunk_size - overlap)

        for start in range(0, len(words), step):
            chunk_words = words[start: start + chunk_size]
            chunk = " ".join(chunk_words)
            if chunk.strip():
                chunks.append(chunk)
            if start + chunk_size >= len(words):
                break

        return chunks

    # ─────────────────────────────────────────────────────────────────────
    # Embedding & storage
    # ─────────────────────────────────────────────────────────────────────

    def embed_and_store(self, documents: list[dict], crop_type: str) -> int:
        """
        Chunk, embed, and upsert *documents* into ChromaDB.

        Args:
            documents: List of {"url", "title", "content", "query"} dicts.
            crop_type: Crop identifier used as a metadata filter.

        Returns:
            Total number of chunks stored.
        """
        if not documents:
            return 0

        all_ids: list[str] = []
        all_embeddings: list[list[float]] = []
        all_documents: list[str] = []
        all_metadatas: list[dict] = []

        scraped_at = datetime.now(timezone.utc).isoformat()

        for doc in documents:
            chunks = self.chunk_text(doc.get("content", ""))
            for i, chunk in enumerate(chunks):
                # Deterministic ID: hash of (url + chunk index)
                chunk_id = hashlib.md5(f"{doc['url']}::{i}".encode()).hexdigest()
                embedding = self.model.encode(chunk).tolist()

                all_ids.append(chunk_id)
                all_embeddings.append(embedding)
                all_documents.append(chunk)
                all_metadatas.append({
                    "url": doc.get("url", ""),
                    "title": doc.get("title", ""),
                    "crop_type": crop_type.lower(),
                    "query": doc.get("query", ""),
                    "scraped_at": scraped_at,
                })

        if all_ids:
            # upsert = insert-or-replace (idempotent)
            self.collection.upsert(
                ids=all_ids,
                embeddings=all_embeddings,
                documents=all_documents,
                metadatas=all_metadatas,
            )
            logger.info(
                "Stored %d chunks for crop_type='%s'", len(all_ids), crop_type
            )

        return len(all_ids)

    # ─────────────────────────────────────────────────────────────────────
    # Semantic search
    # ─────────────────────────────────────────────────────────────────────

    def semantic_search(
        self,
        query: str,
        crop_type: Optional[str] = None,
        n_results: int = 5,
    ) -> list[str]:
        """
        Embed *query* and retrieve the most semantically similar chunks from ChromaDB.

        Args:
            query: Natural-language query.
            crop_type: Optional filter — only return chunks for this crop.
            n_results: Maximum number of chunks to return.

        Returns:
            List of matching text chunks (strings).
        """
        query_embedding = self.model.encode(query).tolist()

        where_filter = None
        if crop_type:
            where_filter = {"crop_type": crop_type.lower()}

        try:
            result = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_filter,
            )
            documents = result.get("documents", [[]])[0]
            return [d for d in documents if d]
        except Exception as exc:
            logger.warning("ChromaDB query failed: %s", exc)
            return []

    # ─────────────────────────────────────────────────────────────────────
    # Utility
    # ─────────────────────────────────────────────────────────────────────

    def count_chunks_for_crop(self, crop_type: str) -> int:
        """Return the number of stored chunks for *crop_type*."""
        try:
            result = self.collection.get(
                where={"crop_type": crop_type.lower()},
            )
            return len(result.get("ids", []))
        except Exception:
            return 0
