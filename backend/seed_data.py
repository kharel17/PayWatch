import os
import sys
from dotenv import load_dotenv

# Add parent directory to path so we can import 'backend'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.pipeline import TransactionPipeline

def main():
    print("Seeding initial data into Supabase...")
    load_dotenv()
    
    # Check if env vars are present
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
        return

    try:
        pipeline = TransactionPipeline()
        success = pipeline.run(transaction_count=25)
        if success:
            print("Successfully seeded 25 transactions!")
        else:
            print("Failed to seed transactions. Check logs.")
    except Exception as e:
        print(f"Error during seeding: {e}")

if __name__ == "__main__":
    main()
