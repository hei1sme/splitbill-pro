"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";

interface DashboardInsightsProps {
  bills: any[];
}

export function DashboardInsights({ bills }: DashboardInsightsProps) {
  // Calculate insights
  const calculateInsights = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Current month bills
    const currentMonthBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });
    
    // Last month bills
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate.getMonth() === lastMonth && billDate.getFullYear() === lastMonthYear;
    });

    // Settlement rate
    const totalBills = bills.length;
    const settledBills = bills.filter(b => b.status === 'SETTLED').length;
    const settlementRate = totalBills > 0 ? (settledBills / totalBills) * 100 : 0;

    // Average settlement time (simplified calculation)
    const settledBillsWithTime = bills.filter(b => b.status === 'SETTLED');
    const avgSettlementDays = settledBillsWithTime.length > 0 ? 
      settledBillsWithTime.reduce((sum, bill) => {
        const created = new Date(bill.createdAt);
        const updated = new Date(bill.updatedAt);
        const diffDays = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0) / settledBillsWithTime.length : 0;

    return {
      currentMonthBills: currentMonthBills.length,
      lastMonthBills: lastMonthBills.length,
      settlementRate,
      avgSettlementDays: Math.round(avgSettlementDays),
      monthlyGrowth: lastMonthBills.length > 0 ? 
        ((currentMonthBills.length - lastMonthBills.length) / lastMonthBills.length) * 100 : 0
    };
  };

  const insights = calculateInsights();

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return "text-green-600";
    if (growth < -10) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-gray-600" />;
  };

  const getSettlementColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monthly Growth */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Activity</span>
            <div className="flex items-center gap-1">
              {getGrowthIcon(insights.monthlyGrowth)}
              <span className={`text-sm font-medium ${getGrowthColor(insights.monthlyGrowth)}`}>
                {insights.monthlyGrowth > 0 ? '+' : ''}{insights.monthlyGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">{insights.currentMonthBills}</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </div>
            <div>
              <div className="font-medium">{insights.lastMonthBills}</div>
              <div className="text-xs text-muted-foreground">Last month</div>
            </div>
          </div>
        </div>

        {/* Settlement Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Settlement Rate</span>
            <Badge variant={insights.settlementRate >= 80 ? "default" : insights.settlementRate >= 60 ? "secondary" : "destructive"}>
              {insights.settlementRate.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={insights.settlementRate} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {insights.settlementRate >= 80 ? "Excellent settlement rate! 🎉" :
             insights.settlementRate >= 60 ? "Good progress on settlements" :
             "Consider following up on pending bills"}
          </div>
        </div>

        {/* Average Settlement Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avg Settlement Time</span>
            <span className={`font-medium ${insights.avgSettlementDays <= 7 ? 'text-green-600' : 
                                                insights.avgSettlementDays <= 14 ? 'text-yellow-600' : 'text-red-600'}`}>
              {insights.avgSettlementDays} days
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {insights.avgSettlementDays <= 7 ? "Fast settlement! Great job!" :
             insights.avgSettlementDays <= 14 ? "Reasonable settlement time" :
             "Consider faster follow-ups"}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="p-2 bg-blue-50 rounded">
              <div className="font-medium text-blue-600">
                {bills.filter(b => b.status === 'ACTIVE').length}
              </div>
              <div className="text-blue-600">Active</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <div className="font-medium text-yellow-600">
                {bills.filter(b => b.status === 'COMPLETED').length}
              </div>
              <div className="text-yellow-600">Ready</div>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <div className="font-medium text-green-600">
                {bills.filter(b => b.status === 'SETTLED').length}
              </div>
              <div className="text-green-600">Settled</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
