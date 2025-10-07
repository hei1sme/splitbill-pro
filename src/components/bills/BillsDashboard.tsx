"use client";

import { MetricCard } from "./MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Users, DollarSign } from "lucide-react";

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Draft</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-500 transition-all"
                    style={{ width: `${totalBills > 0 ? (bills.filter(b => b.status === 'DRAFT').length / totalBills) * 100 : 0}%` }}
                  />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {bills.filter(b => b.status === 'DRAFT').length}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${totalBills > 0 ? (activeBills / totalBills) * 100 : 0}%` }}
                  />
                </div>
                <Badge variant="default" className="bg-orange-500 text-xs">
                  {activeBills}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${totalBills > 0 ? (completedBills / totalBills) * 100 : 0}%` }}
                  />
                </div>
                <Badge variant="default" className="bg-blue-500 text-xs">
                  {completedBills}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Settled</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${totalBills > 0 ? (settledBills / totalBills) * 100 : 0}%` }}
                  />
                </div>
                <Badge variant="default" className="bg-green-500 text-xs">
                  {settledBills}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBills.length > 0 ? (
              <div className="space-y-3">
                {recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        bill.status === 'DRAFT' ? 'bg-gray-500' :
                        bill.status === 'ACTIVE' ? 'bg-orange-500' :
                        bill.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{(bill as any).title || 'Untitled Bill'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        bill.status === 'DRAFT' ? 'border-gray-500 text-gray-600' :
                        bill.status === 'ACTIVE' ? 'border-orange-500 text-orange-600' :
                        bill.status === 'COMPLETED' ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'
                      }`}
                    >
                      {bill.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No bills yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
