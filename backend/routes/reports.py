from fastapi import APIRouter, Query
from datetime import datetime, timedelta
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from backend.db.supabase_client import SupabaseClient

router = APIRouter(prefix="/api/reports", tags=["reports"])
db = SupabaseClient()

@router.get("/daily")
async def get_daily_report(date: str = None):
    """Get daily summary report for a specific date"""
    try:
        if not date:
            date = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Parse date
        report_date = datetime.fromisoformat(date)
        next_date = report_date + timedelta(days=1)
        
        # Get transactions for the day
        all_txns = db.client.table("transactions") \
            .select("*") \
            .gte("created_at", report_date.isoformat()) \
            .lt("created_at", next_date.isoformat()) \
            .execute()
        
        transactions = all_txns.data if hasattr(all_txns, 'data') else []
        
        # Calculate stats
        total = len(transactions)
        completed = len([t for t in transactions if t["status"] == "completed"])
        failed = len([t for t in transactions if t["status"] == "failed"])
        delayed = len([t for t in transactions if t["status"] == "delayed"])
        returned = len([t for t in transactions if t["status"] == "returned"])
        
        total_volume = sum(t["amount"] for t in transactions)
        success_rate = (completed / total * 100) if total > 0 else 0
        
        return {
            "success": True,
            "data": {
                "date": date,
                "total_transactions": total,
                "completed": completed,
                "failed": failed,
                "delayed": delayed,
                "returned": returned,
                "total_volume": total_volume,
                "success_rate": round(success_rate, 2),
                "avg_transaction_amount": round(total_volume / total, 2) if total > 0 else 0
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/export")
async def export_transactions(
    start_date: str = Query(...),
    end_date: str = Query(...)
):
    """Export transactions as CSV for a date range"""
    try:
        # Get transactions for date range
        all_txns = db.client.table("transactions") \
            .select("*") \
            .gte("created_at", start_date) \
            .lte("created_at", end_date) \
            .execute()
        
        transactions = all_txns.data if hasattr(all_txns, 'data') else []
        
        # Create CSV
        output = StringIO()
        if transactions:
            fieldnames = [
                "id", "created_at", "type", "amount", "currency", "status",
                "sender", "receiver", "reference_code", "rail", "settlement_date", "failure_reason"
            ]
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for txn in transactions:
                row = {field: txn.get(field, "") for field in fieldnames}
                writer.writerow(row)
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment;filename=transactions.csv"}
        )
    except Exception as e:
        return {"success": False, "error": str(e)}
