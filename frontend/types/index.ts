export interface Transaction {
  id: string;
  created_at: string;
  type: "ACH" | "Wire" | "RTP" | "International";
  amount: number;
  currency: string;
  status: "completed" | "failed" | "delayed" | "returned";
  sender: string;
  receiver: string;
  reference_code: string;
  rail: string;
  settlement_date: string;
  failure_reason: string | null;
}

export interface Alert {
  id: string;
  created_at: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  transaction_id: string | null;
  dismissed: boolean;
  dismissed_at: string | null;
}

export interface ReconciliationItem {
  id: string;
  transaction_id: string;
  discrepancy_type: string;
  expected_value: string;
  actual_value: string;
  status: "open" | "resolved";
  created_at: string;
  resolved_at: string | null;
}

export interface TransactionStats {
  total_volume: number;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  success_rate: number;
  failure_rate: number;
  period: string;
}

export interface RailStats {
  [key: string]: {
    count: number;
    completed: number;
    failed: number;
    success_rate: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export interface DailyReport {
  date: string;
  total_transactions: number;
  completed: number;
  failed: number;
  delayed: number;
  returned: number;
  total_volume: number;
  success_rate: number;
  avg_transaction_amount: number;
}
