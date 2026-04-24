import {
  ApiResponse,
  Transaction,
  Alert,
  ReconciliationItem,
  TransactionStats,
  RailStats,
  DailyReport,
} from "@/types/index";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Transaction endpoints
export async function fetchTransactions(
  offset: number = 0,
  limit: number = 50,
  filters?: any,
) {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.type && { type: filters.type }),
    ...(filters?.min_date && { min_date: filters.min_date }),
    ...(filters?.max_date && { max_date: filters.max_date }),
  });

  const response = await fetch(`${API_BASE}/api/transactions?${params}`);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json() as Promise<ApiResponse<Transaction[]>>;
}

export async function fetchTransaction(id: string) {
  const response = await fetch(`${API_BASE}/api/transactions/${id}`);
  if (!response.ok) throw new Error("Failed to fetch transaction");
  return response.json() as Promise<ApiResponse<Transaction>>;
}

// Stats endpoints
export async function fetchSummaryStats() {
  const response = await fetch(`${API_BASE}/api/stats/summary`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json() as Promise<ApiResponse<TransactionStats>>;
}

export async function fetchRailStats() {
  const response = await fetch(`${API_BASE}/api/stats/by-rail`);
  if (!response.ok) throw new Error("Failed to fetch rail stats");
  return response.json() as Promise<ApiResponse<RailStats>>;
}

export async function fetchStatusDistribution() {
  const response = await fetch(`${API_BASE}/api/stats/by-status`);
  if (!response.ok) throw new Error("Failed to fetch status distribution");
  return response.json() as Promise<ApiResponse<any>>;
}

// Alerts endpoints
export async function fetchAlerts(
  offset: number = 0,
  limit: number = 100,
  onlyActive: boolean = true,
) {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
    only_active: onlyActive.toString(),
  });

  const response = await fetch(`${API_BASE}/api/alerts?${params}`);
  if (!response.ok) throw new Error("Failed to fetch alerts");
  return response.json() as Promise<ApiResponse<Alert[]>>;
}

export async function dismissAlert(alertId: string) {
  const response = await fetch(`${API_BASE}/api/alerts/${alertId}/dismiss`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Failed to dismiss alert");
  return response.json();
}

export async function fetchAlertStats() {
  const response = await fetch(`${API_BASE}/api/alerts/stats`);
  if (!response.ok) throw new Error("Failed to fetch alert stats");
  return response.json() as Promise<ApiResponse<any>>;
}

// Reconciliation endpoints
export async function fetchReconciliationItems(
  offset: number = 0,
  limit: number = 50,
) {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE}/api/reconciliation?${params}`);
  if (!response.ok) throw new Error("Failed to fetch reconciliation items");
  return response.json() as Promise<ApiResponse<ReconciliationItem[]>>;
}

export async function resolveReconciliationItem(itemId: string) {
  const response = await fetch(
    `${API_BASE}/api/reconciliation/${itemId}/resolve`,
    {
      method: "PATCH",
    },
  );
  if (!response.ok) throw new Error("Failed to resolve reconciliation item");
  return response.json();
}

export async function fetchReconciliationStats() {
  const response = await fetch(`${API_BASE}/api/reconciliation/stats`);
  if (!response.ok) throw new Error("Failed to fetch reconciliation stats");
  return response.json() as Promise<ApiResponse<any>>;
}

// Reports endpoints
export async function fetchDailyReport(date?: string) {
  const params = new URLSearchParams(date ? { date } : {});
  const response = await fetch(`${API_BASE}/api/reports/daily?${params}`);
  if (!response.ok) throw new Error("Failed to fetch daily report");
  return response.json() as Promise<ApiResponse<DailyReport>>;
}

export async function exportTransactions(startDate: string, endDate: string) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`${API_BASE}/api/reports/export?${params}`);
  if (!response.ok) throw new Error("Failed to export transactions");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
