"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  [key: string]: string | number;
};

type LineChartProps = {
  data: DataPoint[];
  xKey: string;
  lines: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
};

export default function LineChart({
  data,
  xKey,
  lines,
  height = 300,
}: LineChartProps) {
  const colors = {
    emerald: "#10b981",
    blue: "#3b82f6",
    yellow: "#eab308",
    purple: "#8b5cf6",
    red: "#ef4444",
    pink: "#ec4899",
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis 
          dataKey={xKey} 
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
        />
        <YAxis 
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "#1e293b", 
            borderColor: "#334155",
            color: "#f8fafc",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f8fafc" }}
        />
        <Legend 
          wrapperStyle={{ color: "#94a3b8" }}
        />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name || line.key}
            stroke={colors[line.color as keyof typeof colors] || colors.blue}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}