"use client";

import { Receipt, Users, DollarSign, CheckCircle2 } from "lucide-react";

interface ConsolidatedStatsProps {
  bills: any[];
  activeGroups: number;
}

export function ConsolidatedStats({ bills, activeGroups }: ConsolidatedStatsProps) {
  // Calculate current month stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
  });

  // Calculate amounts for current month
  const currentMonthAmount = currentMonthBills.reduce((sum, bill) => {
    let billTotal = 0;
    try {
      if (bill.description && bill.description.startsWith('{')) {
        const savedData = JSON.parse(bill.description);
        if (savedData.items) {
          billTotal = savedData.items
            .filter((item: any) => item.type === 'NORMAL')
            .reduce((itemSum: number, item: any) => itemSum + (item.fee || 0), 0);
        }
      }
      
      if (billTotal === 0 && bill.items) {
        billTotal = bill.items.reduce((itemSum: number, item: any) => itemSum + (item.amount || 0), 0);
      }
    } catch (error) {
      console.error('Error calculating bill total:', error);
    }
    return sum + billTotal;
  }, 0);

  // Calculate settlement stats
  const totalBills = bills.length;
  const settledBills = bills.filter(bill => bill.status === 'SETTLED').length;
  const settlementRate = totalBills > 0 ? (settledBills / totalBills) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Bills",
      value: totalBills,
      icon: Receipt,
      subtitle: `${currentMonthBills.length} this month`,
      accent: "from-blue-500 via-indigo-500 to-purple-500"
    },
    {
      title: "Active Groups",
      value: activeGroups,
      icon: Users,
      subtitle: "groups with bills",
      accent: "from-emerald-400 via-teal-400 to-cyan-400"
    },
    {
      title: "This Month",
      value: formatCurrency(currentMonthAmount),
      icon: DollarSign,
      subtitle: `${currentMonthBills.length} bills`,
      accent: "from-purple-500 via-pink-500 to-red-500"
    },
    {
      title: "Settlement Rate",
      value: `${settlementRate.toFixed(0)}%`,
      subtitle: `${settledBills}/${totalBills} settled`,
      icon: CheckCircle2,
      accent: "from-amber-400 via-orange-500 to-pink-500"
    }
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
            Snapshot
          </h2>
          <span className="text-xs text-slate-400">
            {currentMonthBills.length} bills tracked this month
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left text-slate-200 shadow-inner shadow-slate-950/40"
              >
                <div
                  className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent} text-white`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-[0.7rem] uppercase tracking-[0.35em] text-slate-400">
                  {stat.title}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400/80">{stat.subtitle}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
          <div className="flex items-center justify-between text-sm text-slate-200">
            <span className="font-medium">Settlement progress</span>
            <span className="text-slate-300/70">
              {settledBills} of {totalBills} settled
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all"
              style={{ width: `${settlementRate}%` }}
            />
          </div>
          <div className="mt-3 text-xs text-slate-300/80">
            {settlementRate >= 80
              ? "🎉 Excellent progress!"
              : settlementRate >= 60
              ? "👍 Solid rhythm — keep nudging stragglers."
              : "⏰ Follow up on pending shares to stay on track."}
          </div>
        </div>
      </div>
    </div>
  );
}
