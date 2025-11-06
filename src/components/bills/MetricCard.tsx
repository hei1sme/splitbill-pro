"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-50px_rgba(79,70,229,0.9)] backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {trend && (
            <p
              className={`mt-2 text-xs ${
                trend.isPositive ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value).toFixed(1)}%
              {" • "}month over month
            </p>
          )}
        </div>
        <div className="text-2xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}
