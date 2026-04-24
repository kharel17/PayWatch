from fastapi import APIRouter, Query
from backend.db.supabase_client import SupabaseClient

router = APIRouter(prefix="/api/reconciliation", tags=["reconciliation"])
db = SupabaseClient()

@router.get("")
async def list_reconciliation_items(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500)
):
    """Get open reconciliation discrepancies"""
    result = db.get_reconciliation_items(offset=offset, limit=limit)
    return {"success": True, "data": result["data"], "count": result["count"]}

@router.patch("/{item_id}/resolve")
async def resolve_discrepancy(item_id: str):
    """Mark reconciliation item as resolved"""
    if db.resolve_reconciliation_item(item_id):
        return {"success": True, "message": "Discrepancy marked as resolved"}
    return {"success": False, "error": "Failed to resolve discrepancy"}

@router.get("/stats")
async def get_reconciliation_stats():
    """Get reconciliation summary"""
    try:
        open_items = db.client.table("reconciliation_items") \
            .select("*") \
            .eq("status", "open") \
            .execute()
        
        resolved_items = db.client.table("reconciliation_items") \
            .select("*") \
            .eq("status", "resolved") \
            .execute()
        
        open_count = len(open_items.data) if hasattr(open_items, 'data') else 0
        resolved_count = len(resolved_items.data) if hasattr(resolved_items, 'data') else 0
        
        return {
            "success": True,
            "data": {
                "open_discrepancies": open_count,
                "resolved_discrepancies": resolved_count,
                "total": open_count + resolved_count
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
