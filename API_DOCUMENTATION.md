# PayWatch API Documentation

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.paywatch.yourdomain.com`

## Authentication

All endpoints require Bearer token authentication (Supabase Auth). Headers:

```
Authorization: Bearer <YOUR_SUPABASE_TOKEN>
```

## Rate Limiting

- 100 requests per minute per user
- Headers include `X-RateLimit-Remaining` and `X-RateLimit-Reset`

---

## Transactions Endpoints

### GET /api/transactions

List transactions with pagination and filtering.

**Query Parameters:**

- `offset` (int, default=0): Starting index
- `limit` (int, default=50): Results per page (max=500)
- `status` (string, optional): Filter by status (completed/failed/delayed/returned)
- `type` (string, optional): Filter by type (ACH/Wire/RTP/International)
- `min_date` (string, optional): ISO date for start range
- `max_date` (string, optional): ISO date for end range

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "type": "ACH",
      "amount": 1500.0,
      "currency": "USD",
      "status": "completed",
      "sender": "ACME Corp",
      "receiver": "Vendor A Inc",
      "reference_code": "TXN-123456-20240115",
      "rail": "ACH",
      "settlement_date": "2024-01-17T00:00:00Z",
      "failure_reason": null
    }
  ],
  "count": 50
}
```

### GET /api/transactions/{id}

Get single transaction by ID.

**Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

### GET /api/stats/summary

Get summary statistics for last 24 hours.

**Response:**

```json
{
  "success": true,
  "data": {
    "total_volume": 250000.5,
    "total_transactions": 125,
    "successful_transactions": 121,
    "failed_transactions": 4,
    "success_rate": 96.8,
    "failure_rate": 3.2,
    "period": "24 hours"
  }
}
```

### GET /api/stats/by-rail

Get statistics broken down by payment rail.

**Response:**

```json
{
  "success": true,
  "data": {
    "ACH": {
      "count": 50,
      "completed": 48,
      "failed": 2,
      "success_rate": 96.0
    },
    "Wire": {
      "count": 30,
      "completed": 30,
      "failed": 0,
      "success_rate": 100.0
    },
    "RTP": {
      "count": 25,
      "completed": 25,
      "failed": 0,
      "success_rate": 100.0
    },
    "International": {
      "count": 20,
      "completed": 18,
      "failed": 2,
      "success_rate": 90.0
    }
  }
}
```

---

## Reconciliation Endpoints

### GET /api/reconciliation

List open reconciliation discrepancies.

**Query Parameters:**

- `offset` (int, default=0)
- `limit` (int, default=50)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "transaction_id": "uuid",
      "discrepancy_type": "amount_mismatch",
      "expected_value": "1500.00",
      "actual_value": "1500.50",
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z",
      "resolved_at": null
    }
  ],
  "count": 5
}
```

### PATCH /api/reconciliation/{id}/resolve

Mark reconciliation item as resolved.

**Response:**

```json
{
  "success": true,
  "message": "Discrepancy marked as resolved"
}
```

### GET /api/reconciliation/stats

Get reconciliation summary.

**Response:**

```json
{
  "success": true,
  "data": {
    "open_discrepancies": 12,
    "resolved_discrepancies": 45,
    "total": 57
  }
}
```

---

## Alerts Endpoints

### GET /api/alerts

List alerts with optional filtering.

**Query Parameters:**

- `offset` (int, default=0)
- `limit` (int, default=100)
- `only_active` (bool, default=true): Show only non-dismissed alerts

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "type": "high_failure_rate",
      "severity": "high",
      "message": "Failure rate is 6.2% in the last hour",
      "transaction_id": null,
      "dismissed": false,
      "dismissed_at": null
    }
  ],
  "count": 8
}
```

### PATCH /api/alerts/{id}/dismiss

Dismiss an alert.

**Response:**

```json
{
  "success": true,
  "message": "Alert dismissed"
}
```

### GET /api/alerts/stats

Get alert statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "total_active": 3,
    "by_severity": {
      "critical": 1,
      "high": 2,
      "medium": 0,
      "low": 0
    }
  }
}
```

---

## Reports Endpoints

### GET /api/reports/daily

Get daily summary for a specific date.

**Query Parameters:**

- `date` (string, optional): ISO date (defaults to today)

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "total_transactions": 125,
    "completed": 121,
    "failed": 4,
    "delayed": 0,
    "returned": 0,
    "total_volume": 250000.5,
    "success_rate": 96.8,
    "avg_transaction_amount": 2000.0
  }
}
```

### GET /api/reports/export

Export transactions as CSV.

**Query Parameters:**

- `start_date` (string, required): ISO date
- `end_date` (string, required): ISO date

**Response:** CSV file download

---

## Error Handling

All errors return appropriate HTTP status codes with JSON response:

```json
{
  "success": false,
  "error": "Description of the error"
}
```

**Status Codes:**

- 200: Success
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705329600
```

---

## Example Request/Response

### Request

```bash
curl -X GET "http://localhost:8000/api/transactions?limit=10&status=completed" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```
