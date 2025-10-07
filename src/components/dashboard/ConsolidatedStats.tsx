"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
      icon: <Receipt className="h-5 w-5 text-blue-600" />,
      subtitle: `${currentMonthBills.length} this month`,
      color: "text-blue-600"
    },
    {
      title: "Active Groups",
      value: activeGroups,
      icon: <Users className="h-5 w-5 text-green-600" />,
      subtitle: "groups with bills",
      color: "text-green-600"
    },
    {
      title: "This Month",
      value: formatCurrency(currentMonthAmount),
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      subtitle: `${currentMonthBills.length} bills`,
      color: "text-purple-600"
    },
    {
      title: "Settlement Rate",
      value: `${settlementRate.toFixed(0)}%`,
      icon: <CheckCircle2 className="h-5 w-5 text-orange-600" />,
      subtitle: `${settledBills}/${totalBills} settled`,
      color: "text-orange-600"
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">📊 Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={stat.title} className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </div>
            </div>
          ))}
        </div>

        {/* Settlement Progress Bar */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">🎯 Settlement Progress</span>
            <span className="text-sm text-muted-foreground">
              {settledBills} of {totalBills} bills settled
            </span>
          </div>
          <Progress value={settlementRate} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {settlementRate >= 80 ? "🎉 Excellent progress!" :
             settlementRate >= 60 ? "👍 Good settlement rate" :
             "⏰ Consider following up on pending bills"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
