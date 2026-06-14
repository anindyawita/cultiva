"""
AgriWebScraper — Retrieves agricultural knowledge from the web.

Stack:
  1. Bing News RSS  → cari daftar URL artikel (gratis, tidak perlu API key,
                       tidak diblokir ISP, langsung dapat URL artikel asli)
  2. newspaper4k    → extract isi artikel secara otomatis
  3. BeautifulSoup  → fallback parser kalau newspaper4k gagal

Polite scraping: 1.5s delay antar request, max 5 artikel per query.
"""

import time
import logging
import xml.etree.ElementTree as ET
from typing import Optional
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup
from newspaper import Article

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
}

# Tag HTML yang biasanya noise
NOISE_TAGS = [
    "nav", "footer", "header", "aside", "script", "style",
    "noscript", "form", "iframe", "button", "select", "input",
]

BING_RSS_URL = "https://www.bing.com/news/search?q={query}&format=rss"


class AgriWebScraper:
    """
    Cari artikel pertanian via Bing News RSS lalu extract isinya
    dengan newspaper4k. BeautifulSoup dipakai sebagai fallback.
    """

    def __init__(self, max_results: int = 5, request_timeout: int = 12):
        self.max_results = max_results
        self.request_timeout = request_timeout

    # ─────────────────────────────────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────────────────────────────────

    def search_and_scrape(self, query: str, max_results: Optional[int] = None) -> list[dict]:
        """
        1. Cari URL artikel via Bing News RSS.
        2. Extract isi setiap artikel (newspaper4k → BeautifulSoup fallback).
        3. Return list of {"url", "title", "content", "query"}.

        Args:
            query: Kata kunci, contoh: "Padi kebutuhan pupuk NPK Indonesia"
            max_results: Override jumlah hasil.

        Returns:
            List dokumen yang berhasil di-scrape.
        """
        limit = max_results or self.max_results
        articles = self._search_bing_rss(query, limit)

        if not articles:
            logger.warning("Bing RSS tidak menemukan artikel untuk: %s", query)
            return []

        results = []
        for art in articles:
            doc = self._extract_article(art["url"], art["title"], query)
            if doc and len(doc["content"]) > 150:
                results.append(doc)
            time.sleep(1.5)  # polite crawling

        logger.info("Scraped %d artikel untuk query: %s", len(results), query)
        return results

    # ─────────────────────────────────────────────────────────────────────
    # Step 1 — Cari URL via Bing News RSS
    # ─────────────────────────────────────────────────────────────────────

    def _search_bing_rss(self, query: str, max_results: int) -> list[dict]:
        """
        Fetch Bing News RSS dan parse item-itemnya.
        Return list of {"url", "title"} — URL sudah langsung ke artikel asli.
        """
        rss_url = BING_RSS_URL.format(query=quote_plus(query))
        try:
            resp = requests.get(rss_url, headers=HEADERS, timeout=self.request_timeout)
            resp.raise_for_status()
        except Exception as exc:
            logger.warning("Bing RSS fetch gagal untuk '%s': %s", query, exc)
            return []

        try:
            root = ET.fromstring(resp.content)
            items = root.findall(".//item")
            results = []
            for item in items[:max_results]:
                link = item.findtext("link") or ""
                title = item.findtext("title") or ""
                if link.startswith("http"):
                    results.append({"url": link, "title": title})

            logger.info("Bing RSS: %d artikel ditemukan untuk: %s", len(results), query)
            return results
        except ET.ParseError as exc:
            logger.warning("Gagal parse RSS XML: %s", exc)
            return []

    # ─────────────────────────────────────────────────────────────────────
    # Step 2 — Extract artikel: newspaper4k → BeautifulSoup fallback
    # ─────────────────────────────────────────────────────────────────────

    def _extract_article(self, url: str, title_fallback: str, query: str) -> Optional[dict]:
        """
        Extract isi artikel dari URL.
        Coba newspaper4k dulu → fallback BeautifulSoup.
        """
        doc = self._extract_with_newspaper(url, query, title_fallback)
        if doc and len(doc["content"]) > 150:
            return doc

        logger.debug("newspaper4k gagal, coba BeautifulSoup: %s", url[:60])
        return self._extract_with_bs4(url, query, title_fallback)

    def _extract_with_newspaper(self, url: str, query: str, title_fallback: str = "") -> Optional[dict]:
        """Gunakan newspaper4k untuk extract artikel."""
        try:
            article = Article(url, language="id", request_timeout=self.request_timeout)
            article.download()
            article.parse()

            content = article.text.strip()
            title = (article.title or title_fallback or url).strip()

            if not content:
                return None

            return {
                "url": url,
                "title": title,
                "content": content[:8000],
                "query": query,
            }
        except Exception as exc:
            logger.debug("newspaper4k gagal untuk %s: %s", url[:60], exc)
            return None

    def _extract_with_bs4(self, url: str, query: str, title_fallback: str = "") -> Optional[dict]:
        """Fallback: fetch HTML manual lalu parse dengan BeautifulSoup."""
        try:
            resp = requests.get(url, headers=HEADERS, timeout=self.request_timeout)
            resp.raise_for_status()
        except Exception as exc:
            logger.debug("Fetch gagal untuk %s: %s", url[:60], exc)
            return None

        try:
            soup = BeautifulSoup(resp.text, "html.parser")

            for tag in soup(NOISE_TAGS):
                tag.decompose()

            title = (
                (soup.title.string.strip() if soup.title and soup.title.string else None)
                or title_fallback
                or url
            )

            content_el = (
                soup.find("article")
                or soup.find("main")
                or soup.find("div", {"id": "content"})
                or soup.find("div", {"class": "content"})
                or soup.find("div", {"class": "entry-content"})
                or soup.find("div", {"class": "post-content"})
                or soup.body
            )

            if not content_el:
                return None

            text = " ".join(content_el.get_text(separator=" ").split())
            if not text:
                return None

            return {
                "url": url,
                "title": title,
                "content": text[:8000],
                "query": query,
            }
        except Exception as exc:
            logger.debug("BeautifulSoup parse gagal untuk %s: %s", url[:60], exc)
            return None
