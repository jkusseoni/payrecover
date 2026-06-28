"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartDay = {
  date: string;
  label: string;
  success: number;
  failed: number;
};

export default function WebhookTrendChart({ data }: { data: ChartDay[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Success vs Failed Rate
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Last 7 days of webhook delivery performance
          </p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-2 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Successful
          </span>
          <span className="flex items-center gap-2 text-red-700">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Failed
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="successFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="failedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717a", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e4e4e7",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="success"
              name="Successful Webhooks"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#successFill)"
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="failed"
              name="Failed Webhooks"
              stroke="#ef4444"
              strokeWidth={2.5}
              fill="url(#failedFill)"
              dot={{ r: 3, fill: "#ef4444" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
