"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  name: string;
  value: number;
};

type PieChartProps = {
  data: DataPoint[];
  height?: number;
  colors?: string[];
};

export default function PieChart({
  data,
  height = 300,
  colors = ["#10b981", "#3b82f6", "#eab308", "#8b5cf6", "#ef4444", "#ec4899"],
}: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            const percentage = percent ? (percent * 100).toFixed(0) : 0;
            return `${name} ${percentage}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            borderColor: "#334155",
            color: "#f8fafc",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f8fafc" }}
          formatter={(value: any) => {
            // ✅ Fix: Handle undefined or null values
            if (value === undefined || value === null) return "₦0";
            return `₦${Number(value).toLocaleString()}`;
          }}
        />
        <Legend
          wrapperStyle={{ color: "#94a3b8" }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}