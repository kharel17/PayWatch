"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { KPICard } from "@/components/KPICard";
import { TransactionTable } from "@/components/TransactionTable";
import { AlertFeed } from "@/components/AlertFeed";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { RailBreakdown } from "@/components/charts/RailBreakdown";
import { SeedButton } from "@/components/SeedButton";
import {
  fetchSummaryStats,
  fetchTransactions,
  fetchAlerts,
  fetchRailStats,
  dismissAlert,
} from "@/lib/api";
import { Transaction, TransactionStats, Alert, RailStats } from "@/types/index";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { TransactionDetails } from "@/components/TransactionDetails";

export default function Dashboard() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [railStats, setRailStats] = useState<RailStats>({});
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAlertMessage, setSelectedAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, txnRes, alertRes, railRes] = await Promise.all([
          fetchSummaryStats(),
          fetchTransactions(0, 10),
          fetchAlerts(0, 5),
          fetchRailStats(),
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (txnRes.success && txnRes.data) setTransactions(txnRes.data);
        if (alertRes.success && alertRes.data) setAlerts(alertRes.data);
        if (railRes.success && railRes.data) setRailStats(railRes.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">
              Real-time payment transaction monitoring
            </p>
          </div>
          <SeedButton />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Volume"
            value={`$${(stats?.total_volume || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            subtext="Last 24 hours"
            trend={2.5}
            icon={<TrendingUp className="w-6 h-6" />}
            color="blue"
          />
          <KPICard
            title="Success Rate"
            value={`${(stats?.success_rate || 0).toFixed(1)}%`}
            subtext="Successful transactions"
            trend={-1.2}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <KPICard
            title="Failed Transactions"
            value={stats?.failed_transactions || 0}
            subtext="In last 24 hours"
            trend={0}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
          />
          <KPICard
            title="Pending Reconciliation"
            value="0"
            subtext="Open discrepancies"
            trend={0}
            icon={<Clock className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <VolumeChart data={[]} isLoading={loading} />
          <RailBreakdown data={railStats} isLoading={loading} />
        </div>

        {/* Alerts & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">
                Recent Transactions
              </h2>
            </div>
            <TransactionTable
              transactions={transactions.slice(0, 5)}
              isLoading={loading}
              onTransactionClick={setSelectedTransaction}
            />
          </div>
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">Active Alerts</h2>
            </div>
            <AlertFeed
              alerts={alerts}
              isLoading={loading}
              onDismiss={handleDismissAlert}
              onAlertClick={async (txId) => {
                const alert = alerts.find(a => a.transaction_id === txId);
                setSelectedAlertMessage(alert?.message || "Security Trigger");
                
                // Check if we already have it in state
                const localTx = transactions.find(t => t.id === txId);
                if (localTx) {
                  setSelectedTransaction(localTx);
                } else {
                  // Fetch from API
                  const res = await fetch(`http://localhost:8000/api/transactions/${txId}`);
                  const data = await res.json();
                  if (data && data.success) setSelectedTransaction(data.data);
                }
              }}
            />
          </div>
        </div>

        <TransactionDetails 
          transaction={selectedTransaction} 
          alertMessage={selectedAlertMessage}
          onClose={() => {
            setSelectedTransaction(null);
            setSelectedAlertMessage(null);
          }} 
        />
      </div>
    </Layout>
  );
}
