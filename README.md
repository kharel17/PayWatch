# 🔷 PayWatch - Payment Transaction Monitoring & Reconciliation Dashboard

![PayWatch Banner](https://img.shields.io/badge/PayWatch-Payment%20Monitoring-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📋 Overview

**PayWatch** is a production-grade fintech tool built to demonstrate advanced payment monitoring, reconciliation automation, and intelligent alerting workflows—similar to those used in global payroll platforms and modern payment infrastructure.

Real-time monitoring of mock payment transactions across multiple rails (ACH, Wire, RTP, International), automated discrepancy detection, and instant alerts on anomalies. Built to showcase enterprise-grade fintech architecture.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PayWatch Ecosystem                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Next.js 14     │         │   Python FastAPI │
│  (Frontend)      │◄───────►│  (Backend)       │
│  - Dashboard     │   REST   │  - ETL Pipeline  │
│  - Reports       │          │  - Reconciler    │
│  - Alerts UI     │          │  - Alerting      │
└──────────────────┘         └──────────────────┘
        │                             │
        │                             │
        └────────────┬────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Supabase PostgreSQL   │
        │                         │
        │  - transactions table   │
        │  - bank_statements      │
        │  - reconciliation_items │
        │  - alerts table         │
        │  - RLS & Auth           │
        └─────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│         Automated Scheduling (APScheduler)                   │
│                                                              │
│  Every 15 minutes:                                           │
│  1. Generate 50-200 mock transactions                        │
│  2. Run reconciliation against bank statements               │
│  3. Check for alert conditions                               │
│  4. Store results in database                                │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 📊 Dashboard & Monitoring

- **Real-time KPIs**: Total volume, success rate, failure count, settlement times
- **Transaction Volume Chart**: Line chart tracking transactions over time
- **Payment Rail Breakdown**: Bar chart showing ACH/Wire/RTP/International volumes
- **Status Distribution**: Pie chart (completed/failed/delayed/returned)
- **Active Alerts Banner**: Color-coded alerts by severity (red=critical, orange=high, yellow=medium, blue=low)
- **Recent Transactions Table**: Latest 10 transactions with quick filters

### 💼 Transaction Management

- **Full Transaction List**: Paginated table with advanced filters (status, type, date range, amount)
- **Search**: Find transactions by reference code, sender, or receiver
- **Transaction Details**: View full transaction information including failure reasons
- **Rail Breakdown**: See performance metrics for each payment rail

### 🔄 Reconciliation Engine

- **Automated Reconciliation**: Compares transactions against bank statements
- **Discrepancy Detection**:
  - Amount mismatches between transaction and settlement
  - Missing settlements for completed transactions
  - Duplicate reference codes
  - Overdue settlements (>24 hours)
- **Resolution Workflow**: Mark discrepancies as resolved with audit trail

### 🚨 Intelligent Alerting

- **High Failure Rate Alerts**: Triggered when failure rate > 5% in last hour
- **Large Transaction Alerts**: Any transaction > $10,000 USD
- **Returned Transaction Alerts**: Immediate notification of reversals
- **Settlement Overdue Alerts**: Flagged at 24h, critical at 72h
- **Severity Levels**: Low, Medium, High, Critical
- **Alert Dismissal**: Acknowledge and dismiss alerts with timestamp tracking

### 📈 Reporting & Export

- **Daily Summary Reports**: Transaction counts, volume, success rates
- **CSV Export**: Download transactions for custom analysis
- **Date Range Selection**: Export transactions for any date range
- **Report Charts**: Visual breakdowns of daily transaction distribution

### 🔐 Security & Data Integrity

- **Row-Level Security (RLS)**: Database policies enforce authentication
- **Audit Logging**: Track all changes to reconciliation and alerts
- **Role-Based Access**: Support for viewer and admin roles
- **Secure API**: CORS enabled, environment-based configuration

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/) (LineChart, BarChart, PieChart)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) patterns + custom components
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)

### Backend

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Task Scheduling**: [APScheduler](https://apscheduler.readthedocs.io/)
- **Database Client**: [Supabase Python SDK](https://supabase.com/docs/reference/python)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Validation**: [Pydantic](https://docs.pydantic.dev/)

### Database

- **Provider**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Features**: RLS policies, real-time subscriptions, edge functions

### Deployment

- **Frontend**: [Vercel](https://vercel.com/) (recommended)
- **Backend**: [Render](https://render.com/) or [Railway](https://railway.app/)
- **Database**: Supabase hosted PostgreSQL

---

## 📊 Data Schema

### `transactions`

- `id` (UUID): Primary key
- `created_at` (Timestamp): When transaction was created
- `type` (VARCHAR): ACH, Wire, RTP, International
- `amount` (Decimal): Transaction amount
- `currency` (VARCHAR): USD or NPR
- `status` (VARCHAR): completed, failed, delayed, returned
- `sender` (VARCHAR): Sending entity
- `receiver` (VARCHAR): Receiving entity
- `reference_code` (VARCHAR): Unique transaction identifier
- `rail` (VARCHAR): Payment rail name
- `settlement_date` (Timestamp): Expected settlement
- `failure_reason` (TEXT): Why transaction failed (if applicable)

### `bank_statements`

- `id` (UUID): Primary key
- `created_at` (Timestamp): When statement was created
- `reference_code` (VARCHAR): Links to transaction
- `amount` (Decimal): Settled amount
- `currency` (VARCHAR): Currency of settlement
- `settled_at` (Timestamp): When settlement occurred

### `reconciliation_items`

- `id` (UUID): Primary key
- `transaction_id` (UUID): Foreign key to transaction
- `discrepancy_type` (VARCHAR): Type of discrepancy
- `expected_value` (TEXT): What we expected
- `actual_value` (TEXT): What we found
- `status` (VARCHAR): open, resolved
- `created_at` (Timestamp): When discrepancy was flagged
- `resolved_at` (Timestamp): When resolved (if applicable)

### `alerts`

- `id` (UUID): Primary key
- `created_at` (Timestamp): When alert was created
- `type` (VARCHAR): Alert classification
- `severity` (VARCHAR): critical, high, medium, low
- `message` (TEXT): Human-readable alert message
- `transaction_id` (UUID): Related transaction (if applicable)
- `dismissed` (Boolean): Whether alert was acknowledged
- `dismissed_at` (Timestamp): When dismissed

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git
- Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/paywatch.git
cd paywatch
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Set Up Supabase Database

1. Create a new Supabase project
2. In the SQL Editor, run the schema script:

```bash
# Copy the contents of schema.sql and paste into Supabase SQL Editor
# Then run it
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 4. Backend Setup

```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 6. Access the Application

- **Dashboard**: http://localhost:3000/dashboard
- **Transactions**: http://localhost:3000/transactions
- **Reconciliation**: http://localhost:3000/reconciliation
- **Alerts**: http://localhost:3000/alerts
- **Reports**: http://localhost:3000/reports
- **API Docs**: http://localhost:8000/docs

---

## 📡 API Endpoints

### Transactions

- `GET /api/transactions` - List transactions (paginated, filterable)
- `GET /api/transactions/{id}` - Get single transaction
- `GET /api/stats/summary` - Summary statistics
- `GET /api/stats/by-rail` - Statistics by payment rail

### Reconciliation

- `GET /api/reconciliation` - List open discrepancies
- `PATCH /api/reconciliation/{id}/resolve` - Mark as resolved
- `GET /api/reconciliation/stats` - Reconciliation summary

### Alerts

- `GET /api/alerts` - List alerts
- `PATCH /api/alerts/{id}/dismiss` - Dismiss alert
- `GET /api/alerts/stats` - Alert statistics

### Reports

- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily report
- `GET /api/reports/export?start_date=X&end_date=Y` - Export CSV

---

## 📋 ETL Pipeline Details

### Transaction Generation

Runs every 15 minutes by default (configurable):

- Generates 50-200 mock transactions
- Realistic failure rates by rail:
  - ACH: 3% failure rate
  - Wire: 1% failure rate
  - RTP: 0.5% failure rate
  - International: 5% failure rate
- Random sender/receiver pairs, reference codes, amounts

### Reconciliation Process

- Compares each completed transaction against bank statements
- Flags 4 types of discrepancies:
  1. **Amount mismatches**: Transaction amount ≠ Statement amount
  2. **Missing settlements**: Completed but not in bank statements
  3. **Duplicate references**: Same reference code in multiple transactions
  4. **Overdue settlements**: Settlement date > 24 hours past

### Alert Engine

Monitors for:

- **Failure rate spike**: > 5% in last hour (HIGH alert, CRITICAL if > 10%)
- **Large transactions**: > $10,000 USD equivalent
- **Returned transactions**: Any reversed/returned status
- **Settlement delays**: > 24 hours overdue (HIGH), > 72 hours (CRITICAL)

---

## 🧪 Testing the Pipeline

```bash
# In backend directory, activate venv first

# Generate sample transactions manually
python -c "from backend.etl.generate_transactions import TransactionGenerator; print(TransactionGenerator.generate_batch(10))"

# Run full pipeline manually
python -c "from backend.etl.pipeline import TransactionPipeline; pipeline = TransactionPipeline(); pipeline.run()"

# Check scheduler status
# Logs will appear in console when scheduled jobs run
```

---

## 📦 Project Structure

```
paywatch/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration management
│   ├── requirements.txt         # Python dependencies
│   ├── routes/
│   │   ├── transactions.py     # Transaction endpoints
│   │   ├── stats.py            # Statistics endpoints
│   │   ├── reconciliation.py   # Reconciliation endpoints
│   │   ├── alerts.py           # Alert endpoints
│   │   └── reports.py          # Report endpoints
│   ├── etl/
│   │   ├── generate_transactions.py  # Mock data generator
│   │   ├── pipeline.py               # Main ETL orchestration
│   │   ├── reconcile.py              # Reconciliation logic
│   │   └── alert.py                  # Alert detection logic
│   └── db/
│       └── supabase_client.py  # Database client
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Home page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── dashboard/page.tsx  # Dashboard page
│   │   ├── transactions/page.tsx
│   │   ├── reconciliation/page.tsx
│   │   ├── alerts/page.tsx
│   │   └── reports/page.tsx
│   ├── components/
│   │   ├── Layout.tsx          # Sidebar + layout
│   │   ├── KPICard.tsx         # KPI component
│   │   ├── TransactionTable.tsx
│   │   ├── AlertFeed.tsx
│   │   ├── ReconciliationTable.tsx
│   │   └── charts/
│   │       ├── VolumeChart.tsx
│   │       ├── RailBreakdown.tsx
│   │       └── StatusPie.tsx
│   ├── lib/
│   │   └── api.ts              # API client
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── schema.sql                  # Supabase database schema
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## 🎨 UI Features

### Dark Theme

- Professional dark slate background (#0f172a)
- High-contrast text for accessibility
- Color-coded status indicators

### Responsive Design

- Mobile-first approach
- Adapts to tablet and desktop views
- Sidebar collapses on mobile

### Data Visualization

- Real-time line charts for volume trends
- Bar charts for rail performance comparison
- Pie charts for status distribution
- Interactive charts with hover tooltips

### Components

- **KPI Cards**: Trend indicators (↑/↓), color-coded by type
- **Data Tables**: Sortable, paginated, with filters
- **Alert Feed**: Severity badges with icons
- **Status Badges**: Green (completed), Red (failed), Yellow (delayed), Gray (returned)

---

## 🔒 Security Considerations

1. **Environment Variables**: Store sensitive keys in `.env` (never commit)
2. **CORS**: Configured for localhost development; update for production
3. **Authentication**: Supabase Auth ready (auth middleware can be added)
4. **Database RLS**: Row-Level Security policies implemented
5. **API Validation**: Input validation via Pydantic
6. **Rate Limiting**: Can be added via middleware

---

## 📚 Deployment Guide

### Frontend (Vercel)

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL=https://your-api.render.com
```

### Backend (Render)

1. Create Render account
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `pip install -r backend/requirements.txt`
5. Set start command: `uvicorn backend.main:app --host 0.0.0.0`
6. Add environment variables
7. Deploy

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Support & Contact

For questions or issues:

- Open an issue on GitHub
- Email: support@paywatch.example

---

## 🙏 Acknowledgments

Built to demonstrate fintech best practices used by global payment infrastructure platforms. Uses modern web technologies and follows enterprise-grade architecture patterns.

**Built with ❤️ for payment professionals**

---

## 📈 What's Next?

- [ ] Real Stripe/Plaid integration
- [ ] WebSocket real-time updates
- [ ] Machine learning-based anomaly detection
- [ ] Multi-currency settlement optimization
- [ ] International compliance reporting
- [ ] White-label customization
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and ML models

---

**PayWatch v1.0.0** | Production-Ready Payment Monitoring Dashboard
