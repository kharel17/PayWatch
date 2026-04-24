import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface VolumeChartProps {
  data: Array<{
    date: string;
    volume: number;
    transactions: number;
  }>;
  isLoading?: boolean;
}

export function VolumeChart({ data, isLoading }: VolumeChartProps) {
  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center h-64">
        <p className="text-slate-400">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Transaction Volume Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
            }}
            labelStyle={{ color: "#f1f5f9" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#3b82f6"
            dot={false}
            name="Volume ($)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="transactions"
            stroke="#10b981"
            dot={false}
            name="Transactions"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
