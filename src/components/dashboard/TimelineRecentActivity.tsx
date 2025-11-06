"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ExternalLink, Eye } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface TimelineRecentActivityProps {
  bills: any[];
  maxItems?: number;
}

export function TimelineRecentActivity({ bills, maxItems = 3 }: TimelineRecentActivityProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateBillTotal = (bill: any) => {
    let billTotal = 0;
    try {
      if (bill.description && bill.description.startsWith('{')) {
        const savedData = JSON.parse(bill.description);
        if (savedData.items) {
          billTotal = savedData.items
            .filter((item: any) => item.type === 'NORMAL')
            .reduce((sum: number, item: any) => sum + (item.fee || 0), 0);
        }
      }
      
      if (billTotal === 0 && bill.items) {
        billTotal = bill.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      }
    } catch (error) {
      console.error('Error calculating bill total:', error);
    }
    return billTotal;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-700 border-yellow-200", emoji: "✏️" },
      ACTIVE: { variant: "default" as const, color: "bg-blue-100 text-blue-700 border-blue-200", emoji: "🔄" },
      COMPLETED: { variant: "outline" as const, color: "bg-orange-100 text-orange-700 border-orange-200", emoji: "✅" },
      SETTLED: { variant: "outline" as const, color: "bg-green-100 text-green-700 border-green-200", emoji: "💰" },
    };
    const config = variants[status as keyof typeof variants] || variants.DRAFT;
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.emoji} {status}
      </Badge>
    );
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const billDate = new Date(date);
    const diffHours = Math.floor((now.getTime() - billDate.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays === 0) {
      if (diffHours === 0) return "Just now";
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return format(billDate, "MMM d");
    }
  };

  const recentBills = bills
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  if (recentBills.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center text-slate-300/80 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
        <Activity className="mx-auto mb-4 h-10 w-10 opacity-60" />
        <p>No recent activity. Create a bill to kick things off.</p>
        <Button
          variant="outline"
          onClick={() => router.push("/bills?action=add")}
          className="mt-4 rounded-full border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
        >
          Create first bill
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-slate-200 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
          <Activity className="h-4 w-4" />
          Recent activity
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/bills")}
          className="rounded-full text-xs text-slate-300 hover:text-white"
        >
          View all
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-4">
        {recentBills.map((bill, index) => (
          <div key={bill.id} className="relative pl-8">
            {index < recentBills.length - 1 && (
              <div className="absolute left-[1.1rem] top-6 h-12 w-px bg-white/15" />
            )}

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10">
              <div
                className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${
                  bill.status === "SETTLED"
                    ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                    : bill.status === "COMPLETED"
                    ? "bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.2)]"
                    : bill.status === "ACTIVE"
                    ? "bg-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.25)]"
                    : "bg-slate-500 shadow-[0_0_0_4px_rgba(148,163,184,0.2)]"
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-white">
                      🧾 {bill.title}
                    </h4>
                    <p className="text-xs text-slate-300/70">
                      👥 {bill.group?.name || "No Group"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {formatCurrency(calculateBillTotal(bill))}
                    </div>
                    <div className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-400">
                      {getTimeAgo(bill.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  {getStatusBadge(bill.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/bills/${bill.id}`)}
                    className="rounded-full text-xs text-slate-300 hover:text-white"
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bills.length > maxItems && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/bills")}
            className="rounded-full border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
          >
            View {bills.length - maxItems} more activities
          </Button>
        </div>
      )}
    </div>
  );
}
