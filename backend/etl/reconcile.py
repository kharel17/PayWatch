import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from backend.db.supabase_client import SupabaseClient
from backend.config import (
    FAILURE_RATE_THRESHOLD,
    LARGE_TRANSACTION_THRESHOLD,
    SETTLEMENT_DELAY_THRESHOLD
)

logger = logging.getLogger(__name__)

class ReconciliationEngine:
    """
    Compares transactions against bank statements and flags discrepancies.
    Detects: amount mismatches, missing settlements, duplicate reference codes.
    """
    
    def __init__(self):
        self.db = SupabaseClient()
    
    def reconcile(self):
        """Run full reconciliation check"""
        try:
            logger.info("Starting reconciliation process...")
            
            # Get all transactions from last 24 hours
            transactions = self.db.get_transactions_by_status(None, hours=24)
            
            # Get bank statements
            date_from = (datetime.utcnow() - timedelta(days=1)).isoformat()
            bank_statements = self.db.get_bank_statements(date_from=date_from)
            
            # Check for discrepancies
            discrepancies = []
            
            # Check 1: Amount mismatches
            discrepancies.extend(self._check_amount_mismatches(transactions, bank_statements))
            
            # Check 2: Missing settlements
            discrepancies.extend(self._check_missing_settlements(transactions, bank_statements))
            
            # Check 3: Duplicate reference codes
            discrepancies.extend(self._check_duplicates(transactions))
            
            # Check 4: Overdue settlements
            discrepancies.extend(self._check_settlement_delays(transactions))
            
            # Insert discrepancies
            for discrepancy in discrepancies:
                self.db.insert_reconciliation_item(discrepancy)
            
            logger.info(f"Reconciliation complete: {len(discrepancies)} discrepancies found")
            
        except Exception as e:
            logger.error(f"Reconciliation failed: {e}")
    
    def _check_amount_mismatches(self, transactions: List[Dict], statements: List[Dict]) -> List[Dict]:
        """Check for amount mismatches between transactions and statements"""
        discrepancies = []
        
        for txn in transactions:
            if txn["status"] != "completed":
                continue
            
            # Find matching statement
            matching_statement = None
            for stmt in statements:
                if stmt.get("reference_code") == txn.get("reference_code"):
                    matching_statement = stmt
                    break
            
            if matching_statement:
                if matching_statement["amount"] != txn["amount"]:
                    discrepancies.append({
                        "transaction_id": txn["id"],
                        "discrepancy_type": "amount_mismatch",
                        "expected_value": str(txn["amount"]),
                        "actual_value": str(matching_statement["amount"]),
                        "status": "open",
                        "created_at": datetime.utcnow().isoformat()
                    })
        
        return discrepancies
    
    def _check_missing_settlements(self, transactions: List[Dict], statements: List[Dict]) -> List[Dict]:
        """Check for completed transactions missing from bank statements"""
        discrepancies = []
        
        statement_refs = {stmt.get("reference_code") for stmt in statements}
        
        for txn in transactions:
            if txn["status"] != "completed":
                continue
            
            if txn["reference_code"] not in statement_refs:
                discrepancies.append({
                    "transaction_id": txn["id"],
                    "discrepancy_type": "missing_settlement",
                    "expected_value": txn["reference_code"],
                    "actual_value": "Not found in bank statements",
                    "status": "open",
                    "created_at": datetime.utcnow().isoformat()
                })
        
        return discrepancies
    
    def _check_duplicates(self, transactions: List[Dict]) -> List[Dict]:
        """Check for duplicate reference codes"""
        discrepancies = []
        
        reference_codes = {}
        for txn in transactions:
            ref_code = txn.get("reference_code")
            if ref_code:
                if ref_code not in reference_codes:
                    reference_codes[ref_code] = []
                reference_codes[ref_code].append(txn["id"])
        
        for ref_code, txn_ids in reference_codes.items():
            if len(txn_ids) > 1:
                for txn_id in txn_ids:
                    discrepancies.append({
                        "transaction_id": txn_id,
                        "discrepancy_type": "duplicate_reference_code",
                        "expected_value": ref_code,
                        "actual_value": f"Found {len(txn_ids)} transactions with this code",
                        "status": "open",
                        "created_at": datetime.utcnow().isoformat()
                    })
        
        return discrepancies
    
    def _check_settlement_delays(self, transactions: List[Dict]) -> List[Dict]:
        """Check for transactions with overdue settlements"""
        discrepancies = []
        now = datetime.utcnow()
        
        for txn in transactions:
            if txn["status"] != "completed":
                continue
            
            settlement_date = datetime.fromisoformat(txn["settlement_date"])
            delay_hours = (now - settlement_date).total_seconds() / 3600
            
            if delay_hours > SETTLEMENT_DELAY_THRESHOLD:
                discrepancies.append({
                    "transaction_id": txn["id"],
                    "discrepancy_type": "settlement_overdue",
                    "expected_value": txn["settlement_date"],
                    "actual_value": f"Overdue by {int(delay_hours)} hours",
                    "status": "open",
                    "created_at": datetime.utcnow().isoformat()
                })
        
        return discrepancies
