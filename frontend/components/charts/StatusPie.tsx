import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatusPieProps {
  data: {
    [key: string]: number;
  };
  isLoading?: boolean;
}

const COLORS: { [key: string]: string } = {
  completed: "#10b981",
  failed: "#ef4444",
  delayed: "#f59e0b",
  returned: "#64748b",
};

export function StatusPie({ data, isLoading }: StatusPieProps) {
  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center h-64">
        <p className="text-slate-400">Loading chart...</p>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Transaction Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || "#64748b"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
            }}
            labelStyle={{ color: "#f1f5f9" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
