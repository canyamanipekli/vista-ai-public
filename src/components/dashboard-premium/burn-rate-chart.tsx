"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BurnRateChartProps {
  data: { month: string; spend: number; fullLabel: string }[];
}

function formatMoney(value: number) {
  return `$${value.toFixed(0)}`;
}

export function BurnRateChart({ data }: BurnRateChartProps) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 h-[320px] flex items-center justify-center"
      >
        <p className="text-sm text-zinc-500">No trend data yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-white/15 transition-all h-[320px] flex flex-col"
    >
      <h3 className="text-sm font-semibold text-white mb-1">Financial Drift</h3>
      <p className="text-xs text-zinc-500 mb-4">Spending trend · Last 6 months</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatMoney}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10,10,11,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number) => [formatMoney(value), "Spend"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ""}
            />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#6366f1", stroke: "rgba(255,255,255,0.2)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
