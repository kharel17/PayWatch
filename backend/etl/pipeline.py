import logging
from datetime import datetime, timedelta
import random
from backend.db.supabase_client import SupabaseClient
from backend.etl.generate_transactions import TransactionGenerator
from backend.etl.alert import AlertManager
from backend.etl.reconcile import ReconciliationEngine

logger = logging.getLogger(__name__)

class TransactionPipeline:
    """
    Main ETL pipeline that runs on a scheduled interval (15 minutes by default).
    Handles transaction generation, validation, reconciliation, and alerting.
    """
    
    def __init__(self):
        self.db = SupabaseClient()
        self.generator = TransactionGenerator()
        self.alert_manager = AlertManager()
        self.reconciliation = ReconciliationEngine()
    
    def run(self, transaction_count: int = None):
        """
        Execute the full pipeline:
        1. Generate transactions
        2. Insert into database
        3. Run reconciliation
        4. Check for alerts
        """
        try:
            # Generate transaction count between 50-200
            if transaction_count is None:
                transaction_count = random.randint(50, 200)
            
            logger.info(f"Starting pipeline run: generating {transaction_count} transactions")
            
            # Step 1: Generate transactions
            transactions = self.generator.generate_batch(transaction_count)
            
            # Step 2: Insert into database
            if self.db.insert_transactions(transactions):
                logger.info(f"Successfully inserted {transaction_count} transactions")
                
                # Step 2b: Generate corresponding bank statements for some completed txns
                completed_txns = [t for t in transactions if t["status"] == "completed"]
                statements = []
                for txn in completed_txns[:int(len(completed_txns) * 0.8)]: # Reconcile 80%
                    statement = {
                        "reference_code": txn["reference_code"],
                        "amount": txn["amount"] if random.random() > 0.1 else txn["amount"] + random.randint(1, 100), # 10% mismatch
                        "currency": txn["currency"],
                        "settled_at": (datetime.fromisoformat(txn["created_at"]) + timedelta(hours=random.randint(1, 12))).isoformat()
                    }
                    statements.append(statement)
                
                if statements:
                    for s in statements:
                        self.db.insert_bank_statement(s)
            else:
                logger.error(f"Failed to insert transactions")
                return False
            
            # Step 3: Run reconciliation
            logger.info("Running reconciliation...")
            self.reconciliation.reconcile()
            
            # Step 4: Generate alerts
            logger.info("Checking for alert conditions...")
            self.alert_manager.check_and_create_alerts()
            
            logger.info("Pipeline run completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Pipeline run failed: {e}")
            return False

def start_scheduler():
    """Initialize APScheduler for recurring pipeline runs"""
    from apscheduler.schedulers.background import BackgroundScheduler
    from backend.config import TRANSACTION_GENERATOR_INTERVAL, SCHEDULER_ENABLED
    import pytz
    
    if not SCHEDULER_ENABLED:
        logger.info("Scheduler is disabled")
        return None
    
    try:
        scheduler = BackgroundScheduler(timezone=pytz.UTC)
        pipeline = TransactionPipeline()
        
        # Schedule pipeline to run every N minutes
        scheduler.add_job(
            pipeline.run,
            'interval',
            minutes=TRANSACTION_GENERATOR_INTERVAL,
            id='transaction_pipeline',
            name='Transaction ETL Pipeline'
        )
        
        scheduler.start()
        logger.info(f"Scheduler started - pipeline will run every {TRANSACTION_GENERATOR_INTERVAL} minutes")
        return scheduler
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        return None
