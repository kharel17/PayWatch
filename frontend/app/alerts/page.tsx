"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { AlertFeed } from "@/components/AlertFeed";
import { fetchAlerts, dismissAlert } from "@/lib/api";
import { Alert } from "@/types/index";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetchAlerts(0, 500, false);
      if (res.success && res.data) {
        setAlerts(res.data);
      }
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)),
      );
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.dismissed);
  const dismissedAlerts = alerts.filter((a) => a.dismissed);

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
          <p className="text-slate-400">
            {activeAlerts.length} active • {dismissedAlerts.length} dismissed
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Active Alerts</h2>
          {activeAlerts.length > 0 ? (
            <AlertFeed
              alerts={activeAlerts}
              isLoading={loading}
              onDismiss={handleDismiss}
            />
          ) : (
            <div className="card p-6 text-center text-slate-400">
              No active alerts
            </div>
          )}
        </div>

        {dismissedAlerts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Recent Dismissals
            </h2>
            <AlertFeed
              alerts={dismissedAlerts.slice(0, 10)}
              isLoading={false}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
