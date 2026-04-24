import random
import uuid
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class TransactionGenerator:
    """Generates realistic mock payment transactions"""
    
    PAYMENT_RAILS = {
        "Fonepay": {"failure_rate": 0.02, "currency": "NPR"},
        "ConnectIPS": {"failure_rate": 0.01, "currency": "NPR"},
        "SCT": {"failure_rate": 0.03, "currency": "NPR"},
        "International-SWIFT": {"failure_rate": 0.05, "currency": "USD"},
        "RTP": {"failure_rate": 0.005, "currency": "NPR"}
    }
    
    STATUSES = ["completed", "failed", "delayed", "returned"]
    FAILURE_REASONS = [
        "Insufficient funds",
        "Point of failure at bank",
        "Invalid KYC",
        "Daily limit exceeded",
        "Network timeout",
        "Bank CBS unavailable",
        "Duplicate transaction",
        "Fonepay server down",
        None  
    ]
    
    SENDERS = [
        "Nabil Bank Mobile", "Global IME User", "NIC Asia MoBank", "eSewa Wallet",
        "Khalti App", "Prabhu Bank Client", "Investment Bank User", "SCB Nepal",
        "Sanima Bank", "Citizens Bank"
    ]
    
    RECEIVERS = [
        "Bhat-Bhateni Supermarket", "NEA Electricity Bill", "Nepal Telecom (NTC)", "WorldLink Internet",
        "Foodmandu Order", "Daraz Online", "Salesberry", "Civil Mall Cinema",
        "TU Registrar Office", "Government of Nepal Tax"
    ]

    @staticmethod
    def generate_batch(count: int = 100) -> List[Dict[str, Any]]:
        """Generate a batch of mock transactions"""
        transactions = []
        
        for _ in range(count):
            rail = random.choice(list(TransactionGenerator.PAYMENT_RAILS.keys()))
            rail_config = TransactionGenerator.PAYMENT_RAILS[rail]
            
            # Determine if transaction fails
            should_fail = random.random() < rail_config["failure_rate"]
            status = random.choice(["failed", "returned"]) if should_fail else random.choice(["completed", "delayed"])
            
            # Generate transaction
            created_at = datetime.utcnow() - timedelta(minutes=random.randint(0, 1440)) # Up to 24 hours ago
            settlement_date = created_at + timedelta(hours=random.randint(2, 48))
            
            # Realistic amounts for NRS vs USD
            if rail_config["currency"] == "NPR":
                amount = round(random.uniform(10, 200000), 2) # 10 to 2 Lakhs
            else:
                amount = round(random.uniform(5, 5000), 2) # 5 to 5k USD
            
            transaction = {
                "id": str(uuid.uuid4()),
                "created_at": created_at.isoformat(),
                "type": rail,
                "amount": amount,
                "currency": rail_config["currency"],
                "status": status,
                "sender": random.choice(TransactionGenerator.SENDERS),
                "receiver": random.choice(TransactionGenerator.RECEIVERS),
                "reference_code": f"TXN-{random.randint(100000, 999999)}-{datetime.utcnow().strftime('%Y%m%d')}",
                "rail": rail,
                "settlement_date": settlement_date.isoformat(),
                "failure_reason": random.choice(TransactionGenerator.FAILURE_REASONS) if should_fail else None
            }
            
            transactions.append(transaction)
        
        logger.info(f"Generated {count} mock transactions")
        return transactions
