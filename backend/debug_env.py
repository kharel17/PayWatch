import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / '.env'
print(f"Checking for .env at: {env_path.absolute()}")
print(f"Exists: {env_path.exists()}")

load_dotenv(dotenv_path=env_path)

url = os.getenv("SUPABASE_URL")
print(f"SUPABASE_URL: {url}")
