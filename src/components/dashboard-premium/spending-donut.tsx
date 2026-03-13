"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#64748b", // slate
];

interface SpendingDonutProps {
  data: { name: string; value: number; currency?: string }[];
}

function formatMoney(value: number, currency: string = "USD") {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "TRY" ? "₺" : "$";
  return `${sym}${value.toFixed(2)}`;
}

export function SpendingDonut({ data }: SpendingDonutProps) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 h-[320px] flex items-center justify-center"
      >
        <p className="text-sm text-zinc-500">No spending data yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-white/15 transition-all h-[320px] flex flex-col"
    >
      <h3 className="text-sm font-semibold text-white mb-1">Spending by Service</h3>
      <p className="text-xs text-zinc-500 mb-4">Hover for details</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10,10,11,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number) => [formatMoney(value), "Spend"]}
              labelFormatter={(name) => name}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
