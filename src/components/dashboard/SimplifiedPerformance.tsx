"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Create bills to see performance insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settlement Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Settlement Rate</span>
            </div>
            <Badge 
              variant={settlementRate >= 80 ? "default" : settlementRate >= 60 ? "secondary" : "destructive"}
              className={getSettlementRateColor(settlementRate)}
            >
              {settlementRate.toFixed(0)}%
            </Badge>
          </div>
          
          <Progress value={settlementRate} className="h-3" />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {settledBills} settled / {totalBills} total
            </span>
            <span className={`font-medium ${getSettlementRateColor(settlementRate)}`}>
              {getSettlementMessage(settlementRate)}
            </span>
          </div>
        </div>

        {/* Average Settlement Time */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Avg Settlement Time</span>
            </div>
            <Badge 
              variant="outline"
              className={getSettlementTimeColor(Math.round(avgSettlementDays))}
            >
              {Math.round(avgSettlementDays)} days
            </Badge>
          </div>
          
          {/* Visual time indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  avgSettlementDays <= 7 ? 'bg-green-500' :
                  avgSettlementDays <= 14 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (avgSettlementDays / 30) * 100)}%` 
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">30d</span>
          </div>
          
          <div className="text-xs text-center">
            <span className={`font-medium ${getSettlementTimeColor(Math.round(avgSettlementDays))}`}>
              {getTimeMessage(Math.round(avgSettlementDays))}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="text-sm font-semibold text-blue-600">
                {bills.filter(b => b.status === 'ACTIVE').length}
              </div>
              <div className="text-xs text-blue-600">Active</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <div className="text-sm font-semibold text-yellow-600">
                {bills.filter(b => b.status === 'COMPLETED').length}
              </div>
              <div className="text-xs text-yellow-600">Ready</div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="text-sm font-semibold text-green-600">
                {settledBills}
              </div>
              <div className="text-xs text-green-600">Settled</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
