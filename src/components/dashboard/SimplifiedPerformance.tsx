"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Target } from "lucide-react";

interface SimplifiedPerformanceProps {
  bills: any[];
}

export function SimplifiedPerformance({ bills }: SimplifiedPerformanceProps) {
  // Calculate settlement rate
  const totalBills = bills.length;
  const settledBills = bills.filter(bill => bill.status === 'SETTLED').length;
  const settlementRate = totalBills > 0 ? (settledBills / totalBills) * 100 : 0;

  // Calculate average settlement time
  const settledBillsWithTime = bills.filter(b => b.status === 'SETTLED');
  const avgSettlementDays = settledBillsWithTime.length > 0 ? 
    settledBillsWithTime.reduce((sum, bill) => {
      const created = new Date(bill.createdAt);
      const updated = new Date(bill.updatedAt);
      const diffDays = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(1, diffDays); // Minimum 1 day
    }, 0) / settledBillsWithTime.length : 0;

  const getSettlementRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSettlementTimeColor = (days: number) => {
    if (days <= 7) return "text-green-600";
    if (days <= 14) return "text-yellow-600";
    return "text-red-600";
  };

  const getSettlementMessage = (rate: number) => {
    if (rate >= 80) return "🎉 Excellent settlement rate!";
    if (rate >= 60) return "👍 Good progress on settlements";
    return "⏰ Consider following up on pending bills";
  };

  const getTimeMessage = (days: number) => {
    if (days <= 7) return "⚡ Fast settlement time!";
    if (days <= 14) return "📅 Reasonable settlement pace";
    return "🔔 Consider faster follow-ups";
  };

  if (totalBills === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center text-slate-300/80 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
        <Target className="mx-auto mb-4 h-10 w-10 opacity-60" />
        <p>Create bills to see performance insights.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-slate-200 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
            Performance pulse
          </h2>
          <Badge className="rounded-full border border-white/15 bg-white/10 text-[10px] uppercase tracking-[0.28em] text-slate-200">
            {totalBills} tracked
          </Badge>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Target className="h-4 w-4 opacity-70" />
              Settlement rate
            </div>
            <Badge
              variant="outline"
              className={`rounded-full border-white/20 bg-white/10 px-3 py-1 text-xs ${getSettlementRateColor(
                settlementRate
              )}`}
            >
              {settlementRate.toFixed(0)}%
            </Badge>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all"
              style={{ width: `${settlementRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300/80">
            <span>
              {settledBills} settled / {totalBills} total
            </span>
            <span className={`font-medium ${getSettlementRateColor(settlementRate)}`}>
              {getSettlementMessage(settlementRate)}
            </span>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Clock className="h-4 w-4 opacity-70" />
              Avg settlement time
            </div>
            <Badge
              variant="outline"
              className={`rounded-full border-white/20 bg-white/10 px-3 py-1 text-xs ${getSettlementTimeColor(
                Math.round(avgSettlementDays)
              )}`}
            >
              {Math.round(avgSettlementDays)} days
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-2 rounded-full transition-all ${
                  avgSettlementDays <= 7
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                    : avgSettlementDays <= 14
                    ? "bg-gradient-to-r from-amber-400 to-orange-400"
                    : "bg-gradient-to-r from-rose-500 to-red-500"
                }`}
                style={{
                  width: `${Math.min(100, (avgSettlementDays / 30) * 100)}%`,
                }}
              />
            </div>
            <span className="text-xs text-slate-300/70">30d</span>
          </div>
          <div className="text-xs text-slate-300/80">
            {getTimeMessage(Math.round(avgSettlementDays))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-slate-300/80">
          <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2">
            <div className="text-sm font-semibold text-indigo-200">
              {bills.filter((b) => b.status === "ACTIVE").length}
            </div>
            Active
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2">
            <div className="text-sm font-semibold text-amber-200">
              {bills.filter((b) => b.status === "COMPLETED").length}
            </div>
            Ready
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
            <div className="text-sm font-semibold text-emerald-200">
              {settledBills}
            </div>
            Settled
          </div>
        </div>
      </div>
    </div>
  );
}
