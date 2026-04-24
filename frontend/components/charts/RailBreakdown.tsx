import React from "react";
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
import { RailStats } from "@/types/index";

interface RailBreakdownProps {
  data: RailStats;
  isLoading?: boolean;
}

export function RailBreakdown({ data, isLoading }: RailBreakdownProps) {
  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center h-64">
        <p className="text-slate-400">Loading chart...</p>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([rail, stats]) => ({
    rail,
    completed: stats.completed,
    failed: stats.failed,
    total: stats.count,
  }));

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Transactions by Payment Rail
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="rail" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
            }}
            labelStyle={{ color: "#f1f5f9" }}
          />
          <Legend />
          <Bar dataKey="completed" fill="#10b981" name="Completed" />
          <Bar dataKey="failed" fill="#ef4444" name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
