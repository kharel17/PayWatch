from fastapi import APIRouter, Query
from backend.db.supabase_client import SupabaseClient

router = APIRouter(prefix="/api/alerts", tags=["alerts"])
db = SupabaseClient()

@router.get("")
async def list_alerts(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    only_active: bool = Query(True)
):
    """Get alerts, sorted by severity"""
    result = db.get_alerts(only_active=only_active, offset=offset, limit=limit)
    return {
        "success": True,
        "data": result["data"],
        "count": result["count"]
    }

@router.patch("/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str):
    """Dismiss an alert"""
    if db.dismiss_alert(alert_id):
        return {"success": True, "message": "Alert dismissed"}
    return {"success": False, "error": "Failed to dismiss alert"}

@router.get("/stats")
async def get_alert_stats():
    """Get alert statistics"""
    try:
        all_alerts = db.client.table("alerts").select("*").execute()
        alerts = all_alerts.data if hasattr(all_alerts, 'data') else []
        
        active_alerts = [a for a in alerts if not a.get("dismissed")]
        
        severity_counts = {}
        for alert in active_alerts:
            severity = alert.get("severity")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            "success": True,
            "data": {
                "total_active": len(active_alerts),
                "by_severity": severity_counts
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
