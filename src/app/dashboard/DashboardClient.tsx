"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Users,
  Receipt,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ClientOnly } from "@/components/ui/client-only";
import { HydrationSafe } from "@/components/ui/hydration-safe";
import { TopActionBar } from "@/components/dashboard/TopActionBar";
import { ConsolidatedStats } from "@/components/dashboard/ConsolidatedStats";
import { ImprovedGroupsOverview } from "@/components/dashboard/ImprovedGroupsOverview";
import { SimplifiedPerformance } from "@/components/dashboard/SimplifiedPerformance";
import { TimelineRecentActivity } from "@/components/dashboard/TimelineRecentActivity";

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

  return (
    <ClientOnly fallback={<div className="space-y-6 animate-pulse" suppressHydrationWarning>Loading...</div>}>
      <HydrationSafe className="space-y-6">
        {/* Header */}
        <HydrationSafe>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your bill splitting activity
          </p>
        </HydrationSafe>

        {/* 1. Top Action Bar */}
        <TopActionBar 
          totalBills={totalBills}
          activeBills={bills.filter(b => b.status === 'ACTIVE' || b.status === 'COMPLETED').length}
          activeGroups={groups.length}
        />

        {/* 2. Consolidated Stats Overview */}
        <ConsolidatedStats bills={bills} activeGroups={groups.length} />

        {/* 3. Groups Overview & Performance Insights */}
        <HydrationSafe className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImprovedGroupsOverview groups={groups} />
          <SimplifiedPerformance bills={bills} />
        </HydrationSafe>

        {/* 4. Recent Activity Timeline */}
        <TimelineRecentActivity bills={recentBills} maxItems={3} />
    </HydrationSafe>
    </ClientOnly>
  );
}
