"""
preload_knowledge.py — Jalankan SEKALI sebelum backend di-start.

Scrapes internet data untuk semua kombinasi tanaman × fitur,
lalu simpan ke ChromaDB. Setelah ini selesai, backend tidak perlu
scraping lagi saat runtime.

Usage:
    cd backend
    python preload_knowledge.py

    # Untuk force re-scrape semua (hapus data lama):
    python preload_knowledge.py --force
"""

import sys
import time
import logging
import argparse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Semua tanaman yang di-support (sesuai dataset crop recommendation) ──────
CROPS = [
    "Padi",
    "Jagung",
    "Tebu",
    "Kapas",
    "Cabe Rawit",
    "Terung",
    "Ketimun",
    "Paprika",
    "Kacang Panjang",
    "Ubi Kayu",
    "Semangka",
    "Melon",
    "Kembang Kol",
    "Bawang Merah",
    "Kacang Tanah",
    "Kedelai",
]

CROP_TRANSLATIONS = {
    "Padi": "Rice",
    "Jagung": "Maize",
    "Tebu": "Sugarcane",
    "Kapas": "Cotton",
    "Cabe Rawit": "Cayenne pepper",
    "Terung": "Eggplant",
    "Ketimun": "Cucumber",
    "Paprika": "Bell pepper",
    "Kacang Panjang": "Yardlong bean",
    "Ubi Kayu": "Cassava",
    "Semangka": "Watermelon",
    "Melon": "Melon",
    "Kembang Kol": "Cauliflower",
    "Bawang Merah": "Shallot",
    "Kacang Tanah": "Groundnut",
    "Kedelai": "Soybean",
}

# ── Query templates per fitur (English) ───────────────────────────────────────
# {crop} akan diganti nama tanaman versi bahasa Inggris
FEATURE_QUERIES = {
    "irrigation": [
        "{crop} (irrigation OR 'water requirement' OR 'watering schedule')",
        "{crop} (evapotranspiration OR 'water stress' OR 'soil moisture')",
    ],
    "fertilizer": [
        "{crop} NPK fertilizer requirements",
        "{crop} fertilizer application dosage",
    ],
    "monitoring": [
        "{crop} pest disease control",
        "{crop} crop disease symptoms",
    ],
    "harvest": [
        "{crop} harvest time maturity",
        "{crop} harvesting optimal yield",
    ],
    "farm_health": [
        "{crop} optimal soil pH temperature",
        "{crop} crop health issues",
    ],
    "chatbot": [
        "{crop} cultivation guide tips",
        "{crop} farming best practices",
    ],
}



def preload_crop(crop: str, feature: str, scraper, embedder, force: bool) -> int:
    """
    Scrape data untuk satu kombinasi crop × feature dan simpan ke ChromaDB.
    Return jumlah chunk yang disimpan (0 jika sudah ada dan tidak force).
    """
    # Cek apakah sudah ada data
    if not force:
        existing = embedder.count_chunks_for_crop(crop)
        if existing >= 10:  # Restored to 10 since we only have English queries now
            logger.info("  SKIP — %s sudah punya %d chunks di ChromaDB", crop, existing)
            return 0

    queries = FEATURE_QUERIES.get(feature, [])
    crop_en = CROP_TRANSLATIONS.get(crop, crop)
    total_stored = 0

    # Run English Queries
    for template in queries:
        query = template.replace("{crop}", crop_en)
        logger.info("  Scraping (EN): %s", query)

        try:
            docs = scraper.search_and_scrape(query, max_results=3)
            if docs:
                stored = embedder.embed_and_store(docs, crop_type=crop)
                total_stored += stored
                logger.info("    → %d chunk disimpan", stored)
            else:
                logger.warning("    → Tidak ada hasil untuk query ini")
        except Exception as exc:
            logger.warning("    → Gagal: %s", exc)

        time.sleep(1.5)  # polite crawling

    return total_stored


def main():
    parser = argparse.ArgumentParser(description="Preload knowledge base ke ChromaDB")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-scrape semua data meski sudah ada di ChromaDB",
    )
    parser.add_argument(
        "--crops",
        nargs="+",
        help="Hanya scrape tanaman tertentu, contoh: --crops Padi Jagung",
        default=None,
    )
    parser.add_argument(
        "--features",
        nargs="+",
        help="Hanya scrape fitur tertentu, contoh: --features fertilizer harvest",
        default=None,
        choices=list(FEATURE_QUERIES.keys()),
    )
    args = parser.parse_args()

    target_crops = args.crops or CROPS
    target_features = args.features or list(FEATURE_QUERIES.keys())

    logger.info("=" * 60)
    logger.info("🌱 Cultiva Knowledge Preloader")
    logger.info("Tanaman  : %d", len(target_crops))
    logger.info("Fitur    : %s", ", ".join(target_features))
    logger.info("Force    : %s", args.force)
    logger.info("=" * 60)

    # Import di dalam main agar error import tampil jelas
    try:
        from app.core.scraper import AgriWebScraper
        from app.core.embedder import AgriEmbedder
    except ImportError as exc:
        logger.error("Import gagal: %s", exc)
        logger.error("Pastikan kamu menjalankan dari folder backend/")
        sys.exit(1)

    scraper = AgriWebScraper(max_results=3, request_timeout=12)
    embedder = AgriEmbedder()

    total_crops = len(target_crops)
    grand_total = 0

    for i, crop in enumerate(target_crops, 1):
        logger.info("")
        logger.info("[%d/%d] === %s ===", i, total_crops, crop.upper())

        for feature in target_features:
            logger.info("  Fitur: %s", feature)
            stored = preload_crop(crop, feature, scraper, embedder, args.force)
            grand_total += stored

        logger.info("  Selesai untuk %s", crop)

    logger.info("")
    logger.info("=" * 60)
    logger.info("✅ Preload selesai!")
    logger.info("Total chunk tersimpan : %d", grand_total)
    logger.info("ChromaDB location     : ./rag_data/chroma_db")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Sekarang kamu bisa jalankan backend:")
    logger.info("  uvicorn main:app --reload --port 8000")


if __name__ == "__main__":
    main()
