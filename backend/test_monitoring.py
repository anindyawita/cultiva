import sys
import os
import pprint
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# Add backend directory to path just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.services import monitoring_service

def test():
    print("Testing Monitoring Service LLM integration...")
    try:
        result = monitoring_service(
            crop_type="cabai",
            location="Malang,ID",
            planted_date="2026-05-01",
            nitrogen=80.0,
            phosphorus=40.0,
            potassium=50.0,
            temperature=28.0
        )
        print("\n--- RESULTS ---")
        pprint.pprint(result)
    except Exception as e:
        print(f"\nError occurred: {e}")

if __name__ == "__main__":
    test()
