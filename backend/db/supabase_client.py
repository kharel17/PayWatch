from supabase import create_client, Client
import os
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class SupabaseClient:
    """
    Singleton client for Supabase database operations.
    Handles all CRUD operations for PayWatch.
    """
    _instance: Optional["SupabaseClient"] = None
    _client: Optional[Client] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize Supabase client"""
        try:
            url = os.getenv("SUPABASE_URL")
            # Use service_role key for backend operations to bypass RLS
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
            
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY environment variables are required")
            
            self._client = create_client(url, key)
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise

    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            self._initialize()
        return self._client

    # ==================== TRANSACTIONS ====================
    def insert_transactions(self, transactions: List[Dict[str, Any]]) -> bool:
        """Insert batch of transactions"""
        try:
            response = self.client.table("transactions").insert(transactions).execute()
            logger.info(f"Inserted {len(transactions)} transactions")
            return True
        except Exception as e:
            logger.error(f"Error inserting transactions: {e}")
            return False

    def get_transactions(self, offset: int = 0, limit: int = 50, filters: Dict = None) -> Dict:
        """Get paginated transactions with optional filters"""
        try:
            query = self.client.table("transactions").select("*")
            
            if filters:
                if "status" in filters:
                    query = query.eq("status", filters["status"])
                if "type" in filters:
                    query = query.eq("type", filters["type"])
                if "min_date" in filters:
                    query = query.gte("created_at", filters["min_date"])
                if "max_date" in filters:
                    query = query.lte("created_at", filters["max_date"])
            
            response = query.range(offset, offset + limit - 1).execute()
            return {"data": response.data, "count": len(response.data)}
        except Exception as e:
            logger.error(f"Error fetching transactions: {e}")
            return {"data": [], "count": 0}

    def get_transaction_by_id(self, transaction_id: str) -> Dict:
        """Get single transaction by ID"""
        try:
            response = self.client.table("transactions").select("*").eq("id", transaction_id).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logger.error(f"Error fetching transaction {transaction_id}: {e}")
            return {}

    def get_transactions_by_status(self, status: str, hours: int = 1) -> List[Dict]:
        """Get transactions by status within last N hours"""
        try:
            from datetime import datetime, timedelta
            cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
            response = self.client.table("transactions") \
                .select("*") \
                .eq("status", status) \
                .gte("created_at", cutoff_time) \
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching {status} transactions: {e}")
            return []

    # ==================== RECONCILIATION ====================
    def insert_reconciliation_item(self, item: Dict[str, Any]) -> bool:
        """Insert reconciliation discrepancy"""
        try:
            response = self.client.table("reconciliation_items").insert(item).execute()
            logger.info(f"Inserted reconciliation item: {item.get('discrepancy_type')}")
            return True
        except Exception as e:
            logger.error(f"Error inserting reconciliation item: {e}")
            return False

    def get_reconciliation_items(self, offset: int = 0, limit: int = 50) -> Dict:
        """Get open reconciliation items"""
        try:
            response = self.client.table("reconciliation_items") \
                .select("*") \
                .eq("status", "open") \
                .order("created_at", desc=True) \
                .range(offset, offset + limit - 1) \
                .execute()
            return {"data": response.data, "count": len(response.data)}
        except Exception as e:
            logger.error(f"Error fetching reconciliation items: {e}")
            return {"data": [], "count": 0}

    def resolve_reconciliation_item(self, item_id: str) -> bool:
        """Mark reconciliation item as resolved"""
        try:
            from datetime import datetime
            response = self.client.table("reconciliation_items") \
                .update({"status": "resolved", "resolved_at": datetime.utcnow().isoformat()}) \
                .eq("id", item_id) \
                .execute()
            logger.info(f"Resolved reconciliation item: {item_id}")
            return True
        except Exception as e:
            logger.error(f"Error resolving reconciliation item: {e}")
            return False

    # ==================== ALERTS ====================
    def insert_alert(self, alert: Dict[str, Any]) -> bool:
        """Insert alert"""
        try:
            response = self.client.table("alerts").insert(alert).execute()
            logger.info(f"Alert created: {alert.get('type')} - {alert.get('severity')}")
            return True
        except Exception as e:
            logger.error(f"Error inserting alert: {e}")
            return False

    def get_alerts(self, only_active: bool = True, offset: int = 0, limit: int = 100) -> Dict:
        """Get alerts, optionally only active ones"""
        try:
            query = self.client.table("alerts").select("*")
            
            if only_active:
                query = query.eq("dismissed", False)
            
            response = query.order("created_at", desc=True) \
                .order("severity", desc=True) \
                .range(offset, offset + limit - 1) \
                .execute()
            
            return {"data": response.data, "count": len(response.data)}
        except Exception as e:
            logger.error(f"Error fetching alerts: {e}")
            return {"data": [], "count": 0}

    def dismiss_alert(self, alert_id: str) -> bool:
        """Dismiss alert"""
        try:
            from datetime import datetime
            response = self.client.table("alerts") \
                .update({"dismissed": True, "dismissed_at": datetime.utcnow().isoformat()}) \
                .eq("id", alert_id) \
                .execute()
            logger.info(f"Alert dismissed: {alert_id}")
            return True
        except Exception as e:
            logger.error(f"Error dismissing alert: {e}")
            return False

    # ==================== BANK STATEMENTS ====================
    def get_bank_statements(self, date_from: str = None, date_to: str = None) -> List[Dict]:
        """Get bank statements for reconciliation"""
        try:
            query = self.client.table("bank_statements").select("*")
            
            if date_from:
                query = query.gte("created_at", date_from)
            if date_to:
                query = query.lte("created_at", date_to)
            
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching bank statements: {e}")
            return []

    def insert_bank_statement(self, statement: Dict[str, Any]) -> bool:
        """Insert bank statement"""
        try:
            response = self.client.table("bank_statements").insert(statement).execute()
            return True
        except Exception as e:
            logger.error(f"Error inserting bank statement: {e}")
            return False

    # ==================== STATS ====================
    def get_transaction_stats(self, hours: int = 24) -> Dict:
        """Get transaction statistics"""
        try:
            from datetime import datetime, timedelta
            cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
            
            response = self.client.table("transactions") \
                .select("*") \
                .gte("created_at", cutoff_time) \
                .execute()
            
            transactions = response.data
            completed = [t for t in transactions if t["status"] == "completed"]
            failed = [t for t in transactions if t["status"] == "failed"]
            
            total_volume = sum(t["amount"] for t in transactions)
            success_rate = len(completed) / len(transactions) * 100 if transactions else 0
            
            return {
                "total_volume": total_volume,
                "total_count": len(transactions),
                "success_count": len(completed),
                "failure_count": len(failed),
                "success_rate": success_rate,
                "failure_rate": 100 - success_rate
            }
        except Exception as e:
            logger.error(f"Error calculating stats: {e}")
            return {}

    def get_stats_by_rail(self, hours: int = 24) -> Dict:
        """Get statistics broken down by payment rail"""
        try:
            from datetime import datetime, timedelta
            cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
            
            response = self.client.table("transactions") \
                .select("*") \
                .gte("created_at", cutoff_time) \
                .execute()
            
            transactions = response.data
            rails = {}
            
            for rail_type in ["ACH", "Wire", "RTP", "International"]:
                rail_transactions = [t for t in transactions if t["type"] == rail_type]
                completed = [t for t in rail_transactions if t["status"] == "completed"]
                
                rails[rail_type] = {
                    "count": len(rail_transactions),
                    "completed": len(completed),
                    "failed": len([t for t in rail_transactions if t["status"] == "failed"]),
                    "success_rate": len(completed) / len(rail_transactions) * 100 if rail_transactions else 0
                }
            
            return rails
        except Exception as e:
            logger.error(f"Error calculating rail stats: {e}")
            return {}
