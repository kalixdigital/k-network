"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
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

type BarChartProps = {
  data: DataPoint[];
  xKey: string;
  bars: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
};

export default function BarChart({
  data,
  xKey,
  bars,
  height = 300,
}: BarChartProps) {
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
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name || bar.key}
            fill={colors[bar.color as keyof typeof colors] || colors.blue}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}