"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchDailyReport, exportTransactions } from "@/lib/api";
import { DailyReport } from "@/types/index";

export default function ReportsPage() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const loadReport = async (date?: string) => {
    try {
      setLoading(true);
      const res = await fetchDailyReport(date);
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleExport = async () => {
    try {
      await exportTransactions(startDate, endDate);
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };

  const chartData = report
    ? [
        { name: "Completed", value: report.completed },
        { name: "Failed", value: report.failed },
        { name: "Delayed", value: report.delayed },
        { name: "Returned", value: report.returned },
      ]
    : [];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-slate-400">
            Generate and export transaction reports
          </p>
        </div>

        {/* Export Section */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Export Transactions
          </h2>
          <div className="flex gap-4 flex-wrap items-end">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 bg-slate-800 rounded border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 bg-slate-800 rounded border border-slate-700 text-white"
              />
            </div>
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
            >
              Download CSV
            </button>
          </div>
        </div>

        {/* Daily Summary */}
        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card p-4">
                <p className="text-slate-400 text-sm mb-1">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-white">
                  {report.total_transactions}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-slate-400 text-sm mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-white">
                  $
                  {report.total_volume.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-slate-400 text-sm mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {report.success_rate}%
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Transaction Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {loading && (
          <div className="text-center text-slate-400 mt-8">
            Loading report...
          </div>
        )}
      </div>
    </Layout>
  );
}
