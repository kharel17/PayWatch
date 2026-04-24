from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from pathlib import Path
from dotenv import load_dotenv

# Initialize environment variables before any other imports
env_file = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_file)

from backend.routes import transactions, stats, reconciliation, alerts, reports
from backend.etl.pipeline import start_scheduler
from backend.config import API_HOST, API_PORT

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="PayWatch API",
    description="Payment Transaction Monitoring & Reconciliation API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://paywatch.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions.router)
app.include_router(stats.router)
app.include_router(reconciliation.router)
app.include_router(alerts.router)
app.include_router(reports.router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "PayWatch API"}

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "PayWatch - Payment Transaction Monitoring & Reconciliation Dashboard",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize scheduler and other startup tasks"""
    logger.info("Starting PayWatch API...")
    scheduler = start_scheduler()
    if scheduler:
        logger.info("APScheduler initialized successfully")
    app.state.scheduler = scheduler

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    if hasattr(app.state, 'scheduler') and app.state.scheduler:
        app.state.scheduler.shutdown()
        logger.info("Scheduler shut down")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
