from fastapi import APIRouter
from backend.db.supabase_client import SupabaseClient

router = APIRouter(prefix="/api/stats", tags=["stats"])
db = SupabaseClient()

@router.get("/summary")
async def get_summary_stats():
    """Get summary statistics"""
    stats = db.get_transaction_stats(hours=24)
    return {
        "success": True,
        "data": {
            "total_volume": stats.get("total_volume", 0),
            "total_transactions": stats.get("total_count", 0),
            "successful_transactions": stats.get("success_count", 0),
            "failed_transactions": stats.get("failure_count", 0),
            "success_rate": round(stats.get("success_rate", 0), 2),
            "failure_rate": round(stats.get("failure_rate", 0), 2),
            "period": "24 hours"
        }
    }

@router.get("/by-rail")
async def get_rail_statistics():
    """Get statistics broken down by payment rail"""
    stats = db.get_stats_by_rail(hours=24)
    return {
        "success": True,
        "data": stats
    }

@router.get("/by-status")
async def get_status_distribution():
    """Get transaction distribution by status"""
    try:
        all_txns = db.client.table("transactions").select("status").execute()
        transactions = all_txns.data if hasattr(all_txns, 'data') else []
        
        status_counts = {}
        for txn in transactions:
            status = txn.get("status")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "success": True,
            "data": status_counts
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
@router.post("/seed")
async def seed_mock_data():
    """Manually trigger the data generation pipeline"""
    from backend.etl.pipeline import TransactionPipeline
    try:
        pipeline = TransactionPipeline()
        success = pipeline.run()
        if success:
            return {"success": True, "message": "Successfully generated mock data"}
        else:
            return {"success": False, "message": "Failed to generate mock data"}
    except Exception as e:
        return {"success": False, "error": str(e)}
