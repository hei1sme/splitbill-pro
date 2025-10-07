"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Scale } from "lucide-react";

interface FinancialSummaryProps {
  bills: any[];
  currentUserId?: string; // We'll need to implement user context later
}

export function FinancialSummary({ bills, currentUserId }: FinancialSummaryProps) {
  // Calculate financial metrics
  const calculateFinancials = () => {
    let totalOwedToYou = 0;
    let totalYouOwe = 0;
    let settledAmount = 0;
    let pendingAmount = 0;

    bills.forEach(bill => {
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

      if (bill.status === 'SETTLED') {
        settledAmount += billTotal;
      } else if (bill.status === 'ACTIVE' || bill.status === 'COMPLETED') {
        pendingAmount += billTotal;
        
        // For now, assume current user is the payer for demonstration
        // In a real app, we'd check if currentUserId === bill.payerId
        if (bill.payerId === currentUserId) {
          totalOwedToYou += billTotal;
        } else {
          totalYouOwe += billTotal * 0.3; // Assume user pays 30% on average
        }
      }
    });

    return {
      totalOwedToYou,
      totalYouOwe,
      netBalance: totalOwedToYou - totalYouOwe,
      settledAmount,
      pendingAmount
    };
  };

  const financials = calculateFinancials();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getBalanceVariant = (balance: number) => {
    if (balance > 0) return 'success';
    if (balance < 0) return 'destructive';
    return 'default';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (balance < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Scale className="h-4 w-4 text-gray-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Net Balance - Most Important */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getBalanceIcon(financials.netBalance)}
            <span className="text-sm font-medium text-muted-foreground">Net Balance</span>
          </div>
          <div className={`text-3xl font-bold ${
            financials.netBalance > 0 ? 'text-green-600' : 
            financials.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {formatCurrency(Math.abs(financials.netBalance))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {financials.netBalance > 0 ? 'You are owed' : 
             financials.netBalance < 0 ? 'You owe' : 'All settled'}
          </p>
        </div>

        <Separator />

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Owed to You</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(financials.totalOwedToYou)}
            </div>
            <p className="text-xs text-muted-foreground">
              From group members
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">You Owe</span>
            </div>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(financials.totalYouOwe)}
            </div>
            <p className="text-xs text-muted-foreground">
              To other members
            </p>
          </div>
        </div>

        <Separator />

        {/* Settlement Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Settled:</span>
            <span className="font-medium">{formatCurrency(financials.settledAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending:</span>
            <span className="font-medium">{formatCurrency(financials.pendingAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
