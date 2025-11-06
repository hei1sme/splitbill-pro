"use client";

import { MetricCard } from "./MetricCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";

interface BillsDashboardProps {
  bills: Array<{
    id: string;
    status: string;
    createdAt: string;
    items?: any[];
    description?: string;
  }>;
}

export function BillsDashboard({ bills }: BillsDashboardProps) {
  // Only show dashboard if there are bills to avoid empty state
  if (bills.length === 0) {
    return null;
  }

  // Calculate metrics
  const totalBills = bills.length;
  const activeBills = bills.filter(bill => bill.status === 'ACTIVE').length;
  const completedBills = bills.filter(bill => bill.status === 'COMPLETED').length;
  const settledBills = bills.filter(bill => bill.status === 'SETTLED').length;
  
  // Calculate total amount across all bills
  const totalAmount = bills.reduce((sum, bill) => {
    let billTotal = 0;
    try {
      // Try to get total from saved bill data first
      if (bill.description && bill.description.startsWith('{')) {
        const savedData = JSON.parse(bill.description);
        if (savedData.items) {
          billTotal = savedData.items
            .filter((item: any) => item.type === 'NORMAL')
            .reduce((itemSum: number, item: any) => itemSum + (item.fee || 0), 0);
        }
      }
      
      // Fallback to database items
      if (billTotal === 0 && bill.items) {
        billTotal = bill.items.reduce((itemSum: number, item: any) => itemSum + (item.amount || 0), 0);
      }
    } catch (error) {
      console.error('Error calculating bill total:', error);
    }
    return sum + billTotal;
  }, 0);

  // Calculate trends (comparing with previous period - mock data for now)
  const previousMonthTotal = totalBills * 0.85; // Mock data
  const billsTrend = Math.round(((totalBills - previousMonthTotal) / previousMonthTotal * 100) * 10) / 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Recent activity (last 5 bills)
  const recentBills = bills
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 mb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Bills"
          value={totalBills}
          icon="📄"
          trend={{ value: Math.abs(billsTrend), isPositive: billsTrend > 0 }}
        />
        <MetricCard
          title="Active Bills"
          value={activeBills}
          icon="🔴"
        />
        <MetricCard
          title="Total Amount"
          value={formatCurrency(totalAmount)}
          icon="💰"
        />
        <MetricCard
          title="Settled Bills"
          value={settledBills}
          icon="✅"
        />
      </div>

      {/* Status Overview & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-slate-200 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
              <TrendingUp className="h-4 w-4" />
              Status overview
            </h3>
            <Badge className="rounded-full border border-white/15 bg-white/10 text-[10px] uppercase tracking-[0.28em] text-slate-200">
              {totalBills} total
            </Badge>
          </div>
          <div className="space-y-4 text-sm text-slate-200">
            {[
              {
                label: "Draft",
                value: bills.filter((b) => b.status === "DRAFT").length,
                gradient: "from-slate-400 to-slate-500",
              },
              {
                label: "Active",
                value: activeBills,
                gradient: "from-orange-400 to-orange-500",
              },
              {
                label: "Completed",
                value: completedBills,
                gradient: "from-blue-400 to-indigo-500",
              },
              {
                label: "Settled",
                value: settledBills,
                gradient: "from-emerald-400 to-teal-500",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  {item.label}
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                      style={{
                        width: `${
                          totalBills > 0 ? (item.value / totalBills) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <Badge className="rounded-full border border-white/20 bg-white/10 text-[10px] uppercase tracking-[0.28em] text-slate-200">
                    {item.value}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-slate-200 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
              <Calendar className="h-4 w-4" />
              Recent bills
            </h3>
            <Badge className="rounded-full border border-white/15 bg-white/10 text-[10px] uppercase tracking-[0.28em] text-slate-200">
              {recentBills.length} shown
            </Badge>
          </div>
          {recentBills.length > 0 ? (
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        bill.status === "DRAFT"
                          ? "bg-slate-400"
                          : bill.status === "ACTIVE"
                          ? "bg-orange-400"
                          : bill.status === "COMPLETED"
                          ? "bg-blue-400"
                          : "bg-emerald-400"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-white">
                        {(bill as any).title || "Untitled Bill"}
                      </p>
                      <p className="text-xs text-slate-300/70">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border border-white/15 bg-white/10 text-[10px] uppercase tracking-[0.28em] text-slate-200"
                  >
                    {bill.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No bills yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
