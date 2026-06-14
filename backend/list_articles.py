import sys
from collections import defaultdict
from app.core.embedder import AgriEmbedder

try:
    embedder = AgriEmbedder()
    data = embedder.collection.get()
except Exception as e:
    print(f"Error loading database: {e}")
    sys.exit(1)

ids = data.get("ids", [])
metadatas = data.get("metadatas", [])
documents = data.get("documents", [])

if not ids:
    print("\n[!] Database ChromaDB masih kosong. Silakan lakukan scraping terlebih dahulu.\n")
    sys.exit(0)

# Group chunks by crop and then by article URL to group chunks belonging to the same article
crop_articles = defaultdict(lambda: defaultdict(list))

for i in range(len(ids)):
    meta = metadatas[i]
    doc = documents[i]
    crop = meta.get("crop_type", "unknown").upper()
    url = meta.get("url", "")
    title = meta.get("title", "No Title")
    
    crop_articles[crop][url].append({
        "title": title,
        "content": doc
    })

print("\n" + "="*80)
print("🌱 CULTIVA AI — KNOWLEDGE BASE ARTICLES REPORT")
print("="*80)
print(f"Total Chunks Tersimpan: {len(ids)}")
print(f"Total Tanaman Terdaftar: {len(crop_articles)}")
print("="*80 + "\n")

for crop, articles in sorted(crop_articles.items()):
    print(f"🔹 TANAMAN: {crop}")
    print("-" * 80)
    for idx, (url, chunks) in enumerate(articles.items(), 1):
        title = chunks[0]["title"]
        # Create a clean snippet preview
        preview = chunks[0]["content"][:180].replace("\n", " ").strip() + "..."
        
        print(f"  [{idx}] {title}")
        print(f"      🔗 URL     : {url}")
        print(f"      📄 Preview : {preview}")
        print(f"      📦 Chunks  : {len(chunks)} chunk(s)")
        print()
    print("=" * 80 + "\n")
