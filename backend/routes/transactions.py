from fastapi import APIRouter, Query
from typing import Optional
from backend.db.supabase_client import SupabaseClient

router = APIRouter(prefix="/api/transactions", tags=["transactions"])
db = SupabaseClient()

@router.get("")
async def list_transactions(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    status: Optional[str] = None,
    type: Optional[str] = None,
    min_date: Optional[str] = None,
    max_date: Optional[str] = None
):
    """Get paginated transactions with optional filters"""
    filters = {}
    if status:
        filters["status"] = status
    if type:
        filters["type"] = type
    if min_date:
        filters["min_date"] = min_date
    if max_date:
        filters["max_date"] = max_date
    
    result = db.get_transactions(offset=offset, limit=limit, filters=filters)
    return {"success": True, "data": result["data"], "count": result["count"]}

@router.get("/{transaction_id}")
async def get_transaction(transaction_id: str):
    """Get single transaction by ID"""
    transaction = db.get_transaction_by_id(transaction_id)
    if transaction:
        return {"success": True, "data": transaction}
    return {"success": False, "error": "Transaction not found"}

@router.get("/stats/by-rail")
async def get_rail_breakdown():
    """Get transaction statistics broken down by payment rail"""
    stats = db.get_stats_by_rail(hours=24)
    return {"success": True, "data": stats}
