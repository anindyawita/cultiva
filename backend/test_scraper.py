import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-8s | %(message)s")

from app.core.scraper import AgriWebScraper

s = AgriWebScraper(max_results=3)
results = s.search_and_scrape("Padi kebutuhan pupuk NPK Indonesia", max_results=3)

print(f"\n{'='*60}")
print(f"HASIL: {len(results)} artikel berhasil di-scrape")
for i, r in enumerate(results, 1):
    print(f"\n[{i}] {r['title'][:70]}")
    print(f"    URL    : {r['url'][:80]}")
    print(f"    Chars  : {len(r['content'])}")
    print(f"    Preview: {r['content'][:300]}")
    print()
