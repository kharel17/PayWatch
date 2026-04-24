import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in several likely locations
env_locations = [
    Path('.') / '.env',                                # Current working directory
    Path(__file__).parent / '.env',                    # Same directory as config.py
    Path(__file__).parent.parent / '.env'              # Parent directory of config.py
]

for loc in env_locations:
    if loc.exists():
        load_dotenv(dotenv_path=loc, override=True)
        break

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "")

# API Configuration
API_PORT = int(os.getenv("API_PORT", 8000))
API_HOST = os.getenv("API_HOST", "0.0.0.0")

# APScheduler Configuration
SCHEDULER_ENABLED = os.getenv("SCHEDULER_ENABLED", "true").lower() == "true"
TRANSACTION_GENERATOR_INTERVAL = int(os.getenv("TRANSACTION_GENERATOR_INTERVAL", 15))  # minutes

# Alert Configuration
FAILURE_RATE_THRESHOLD = float(os.getenv("FAILURE_RATE_THRESHOLD", 0.05))  # 5%
LARGE_TRANSACTION_THRESHOLD = float(os.getenv("LARGE_TRANSACTION_THRESHOLD", 10000))  # USD
SETTLEMENT_DELAY_THRESHOLD = int(os.getenv("SETTLEMENT_DELAY_THRESHOLD", 24))  # hours

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
