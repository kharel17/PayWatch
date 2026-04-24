import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from backend.db.supabase_client import SupabaseClient
from backend.config import (
    FAILURE_RATE_THRESHOLD,
    LARGE_TRANSACTION_THRESHOLD,
    SETTLEMENT_DELAY_THRESHOLD
)

logger = logging.getLogger(__name__)

class AlertManager:
    """
    Monitors transactions for alert conditions and creates alerts.
    Alert Types:
    - high_failure_rate: > 5% failure rate in last hour
    - large_transaction: transaction > $10,000 USD
    - returned_transaction: any returned transaction
    - settlement_overdue: settlement delayed > 24 hours
    """
    
    SEVERITY_LEVELS = {
        "low": 1,
        "medium": 2,
        "high": 3,
        "critical": 4
    }
    
    def __init__(self):
        self.db = SupabaseClient()
    
    def check_and_create_alerts(self):
        """Check all alert conditions and create alerts as needed"""
        try:
            logger.info("Running alert checks...")
            
            # Check 1: High failure rate
            self._check_failure_rate()
            
            # Check 2: Large transactions
            self._check_large_transactions()
            
            # Check 3: Returned transactions
            self._check_returned_transactions()
            
            # Check 4: Settlement delays
            self._check_settlement_delays()
            
            logger.info("Alert checks completed")
            
        except Exception as e:
            logger.error(f"Alert check failed: {e}")
    
    def _check_failure_rate(self):
        """Check if failure rate exceeds threshold in last hour"""
        try:
            stats = self.db.get_transaction_stats(hours=1)
            
            if stats and stats.get("total_count", 0) > 0:
                failure_rate = stats.get("failure_rate", 0) / 100
                
                if failure_rate > FAILURE_RATE_THRESHOLD:
                    severity = "critical" if failure_rate > 0.10 else "high"
                    alert = {
                        "type": "high_failure_rate",
                        "severity": severity,
                        "message": f"Failure rate is {failure_rate*100:.1f}% in the last hour (threshold: {FAILURE_RATE_THRESHOLD*100}%)",
                        "transaction_id": None,
                        "dismissed": False,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    self.db.insert_alert(alert)
                    logger.warning(f"Alert created: {alert['type']} - {alert['severity']}")
        
        except Exception as e:
            logger.error(f"Failure rate check failed: {e}")
    
    def _check_large_transactions(self):
        """Create alerts for large transactions"""
        try:
            # Get transactions from last hour
            from datetime import datetime, timedelta, timezone
            cutoff_time = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
            
            all_txns = self.db.client.table("transactions") \
                .select("*") \
                .gte("created_at", cutoff_time) \
                .execute()
            
            transactions = all_txns.data if hasattr(all_txns, 'data') else []
            
            for txn in transactions:
                # Convert to USD if needed
                amount_usd = txn["amount"]
                if txn["currency"] == "NPR":
                    # Mock conversion rate: 1 USD = 130 NPR
                    amount_usd = txn["amount"] / 130
                
                if amount_usd > LARGE_TRANSACTION_THRESHOLD:
                    # Check if alert already exists for this transaction
                    existing = self.db.client.table("alerts") \
                        .select("*") \
                        .eq("transaction_id", txn["id"]) \
                        .eq("type", "large_transaction") \
                        .eq("dismissed", False) \
                        .execute()
                    
                    if not hasattr(existing, 'data') or not existing.data:
                        alert = {
                            "type": "large_transaction",
                            "severity": "high",
                            "message": f"Large transaction detected: ${amount_usd:,.2f} from {txn['sender']} to {txn['receiver']}",
                            "transaction_id": txn["id"],
                            "dismissed": False,
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }
                        self.db.insert_alert(alert)
        
        except Exception as e:
            logger.error(f"Large transaction check failed: {e}")
    
    def _check_returned_transactions(self):
        """Create alerts for returned transactions"""
        try:
            from datetime import datetime, timedelta
            cutoff_time = (datetime.utcnow() - timedelta(hours=1)).isoformat()
            
            returned_txns = self.db.client.table("transactions") \
                .select("*") \
                .eq("status", "returned") \
                .gte("created_at", cutoff_time) \
                .execute()
            
            transactions = returned_txns.data if hasattr(returned_txns, 'data') else []
            
            for txn in transactions:
                # Check if alert already exists
                existing = self.db.client.table("alerts") \
                    .select("*") \
                    .eq("transaction_id", txn["id"]) \
                    .eq("type", "returned_transaction") \
                    .eq("dismissed", False) \
                    .execute()
                
                if not hasattr(existing, 'data') or not existing.data:
                    alert = {
                        "type": "returned_transaction",
                        "severity": "medium",
                        "message": f"Transaction returned: {txn['reference_code']} - {txn['amount']} {txn['currency']}",
                        "transaction_id": txn["id"],
                        "dismissed": False,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    self.db.insert_alert(alert)
        
        except Exception as e:
            logger.error(f"Returned transaction check failed: {e}")
    
    def _check_settlement_delays(self):
        """Create alerts for settlement delays"""
        try:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            
            all_txns = self.db.client.table("transactions") \
                .select("*") \
                .eq("status", "completed") \
                .execute()
            
            transactions = all_txns.data if hasattr(all_txns, 'data') else []
            
            for txn in transactions:
                settlement_date = datetime.fromisoformat(txn["settlement_date"])
                delay_hours = (now - settlement_date).total_seconds() / 3600
                
                if delay_hours > SETTLEMENT_DELAY_THRESHOLD:
                    # Check if alert already exists
                    existing = self.db.client.table("alerts") \
                        .select("*") \
                        .eq("transaction_id", txn["id"]) \
                        .eq("type", "settlement_overdue") \
                        .eq("dismissed", False) \
                        .execute()
                    
                    if not hasattr(existing, 'data') or not existing.data:
                        severity = "critical" if delay_hours > 72 else "high"
                        alert = {
                            "type": "settlement_overdue",
                            "severity": severity,
                            "message": f"Settlement overdue by {int(delay_hours)} hours for {txn['reference_code']}",
                            "transaction_id": txn["id"],
                            "dismissed": False,
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }
                        self.db.insert_alert(alert)
        
        except Exception as e:
            logger.error(f"Settlement delay check failed: {e}")
