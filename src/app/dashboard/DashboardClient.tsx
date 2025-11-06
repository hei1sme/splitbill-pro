"use client";

import React from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { HydrationSafe } from "@/components/ui/hydration-safe";
import { TopActionBar } from "@/components/dashboard/TopActionBar";
import { ConsolidatedStats } from "@/components/dashboard/ConsolidatedStats";
import { ImprovedGroupsOverview } from "@/components/dashboard/ImprovedGroupsOverview";
import { SimplifiedPerformance } from "@/components/dashboard/SimplifiedPerformance";
import { TimelineRecentActivity } from "@/components/dashboard/TimelineRecentActivity";
import { PageHero } from "@/components/layout/PageHero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardData {
  bills: any[];
  recentBills: any[];
  groups: any[];
  peopleCount: number;
}

interface DashboardClientProps {
  data: DashboardData;
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const { bills, recentBills, groups, peopleCount } = data;

  // Calculate summary statistics
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => {
    // Try to get total from saved bill data first
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
      
      // Fallback to database items if no saved data
      if (billTotal === 0 && bill.items) {
        billTotal = bill.items.reduce((itemSum: number, item: any) => itemSum + (item.amount || 0), 0);
      }
    } catch (error) {
      console.error('Error calculating bill total:', error);
      // Fallback to database items on error
      billTotal = bill.items ? bill.items.reduce((itemSum: number, item: any) => itemSum + (item.amount || 0), 0) : 0;
    }
    
    return sum + billTotal;
  }, 0);
  const settledBills = bills.filter(bill => bill.status === 'SETTLED').length;
  const avgBillAmount = totalBills > 0 ? totalAmount / totalBills : 0;

  // Group bills by status
  const billsByStatus = bills.reduce((acc, bill) => {
    acc[bill.status] = (acc[bill.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentActivity = bills.filter(bill => new Date(bill.updatedAt) > thirtyDaysAgo);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const heroStats = [
    {
      label: "Total volume",
      value: formatCurrency(totalAmount),
      helper: `${totalBills} cumulative bills`,
    },
    {
      label: "Settlement rate",
      value:
        totalBills > 0
          ? `${Math.round((settledBills / totalBills) * 100)}%`
          : "0%",
      helper: `${settledBills} fully settled`,
    },
    {
      label: "Active groups",
      value: `${groups.length}`,
      helper: `${peopleCount} participants in network`,
    },
    {
      label: "30 day activity",
      value: `${recentActivity.length}`,
      helper: "Bills updated in last 30 days",
    },
  ];

  return (
    <ClientOnly
      fallback={
        <div className="space-y-6 animate-pulse" suppressHydrationWarning>
          Loading dashboard...
        </div>
      }
    >
      <HydrationSafe className="space-y-10">
        <PageHero
          eyebrow="Control center"
          title="Mission control for every shared expense"
          description="Track settlement health, surface the busiest groups, and unblock payments before deadlines. All insights are live and collaborative."
          accent="indigo"
          stats={heroStats}
          actions={
            <Link href="/bills?action=add">
              <Button className="group rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15">
                <Plus className="mr-2 h-4 w-4 transition group-hover:rotate-12" />
                Create bill
              </Button>
            </Link>
          }
        />

        <TopActionBar
          totalBills={totalBills}
          activeBills={
            bills.filter(
              (b) => b.status === "ACTIVE" || b.status === "COMPLETED"
            ).length
          }
          activeGroups={groups.length}
        />

        <ConsolidatedStats bills={bills} activeGroups={groups.length} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ImprovedGroupsOverview groups={groups} />
          <SimplifiedPerformance bills={bills} />
        </div>

        <TimelineRecentActivity bills={recentBills} maxItems={4} />
      </HydrationSafe>
    </ClientOnly>
  );
}
